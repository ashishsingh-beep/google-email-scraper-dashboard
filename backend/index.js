import path from "path";
import fs from "fs";
import express from "express";
import http from "http";
import cors from "cors";
import multer from "multer";
import { Server } from "socket.io";
import { spawn } from "child_process";
import treeKill from "tree-kill";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

// Resolve ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// In the new structure, the scraper lives under backend/src
const SCRAPER_DIR = __dirname; // backend folder
const INPUT_CSV = path.join(__dirname, 'src', 'input.csv');

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for CSV uploads (memory storage then write to file)
const upload = multer({ storage: multer.memoryStorage() });

// In-memory state
let child = null;
let startedAt = null;
let browsers = null;
let tabsPerBrowser = null;
let totalRows = 0;
let completedRows = 0;

// Socket.IO namespace for logs
const logsNs = io.of('/logs');

logsNs.on('connection', (socket) => {
  // On connect, send current status snapshot
  socket.emit('status', child ? 'running' : 'stopped');
  socket.emit('progress', { completed: completedRows, total: totalRows });
});

function countCsvRows(bufferOrPath) {
  try {
    let text = '';
    if (Buffer.isBuffer(bufferOrPath)) {
      text = bufferOrPath.toString('utf8');
    } else {
      if (!fs.existsSync(bufferOrPath)) return 0;
      text = fs.readFileSync(bufferOrPath, 'utf8');
    }
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return 0;
    if (/^(query|q|search)/i.test(lines[0])) lines.shift();
    return lines.length;
  } catch (_) {
    return 0;
  }
}

function humanUptime(start) {
  if (!start) return '0s';
  const sec = Math.floor((Date.now() - start.getTime()) / 1000);
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  const hh = Math.floor(mm / 60);
  const m2 = mm % 60;
  return hh > 0 ? `${hh}:${String(m2).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${mm}:${String(ss).padStart(2, '0')}`;
}

function startScraper({ b, t }) {
  if (child) return { ok: false, reason: 'already-running' };

  // Read current total rows from CSV
  totalRows = countCsvRows(INPUT_CSV);
  completedRows = 0;

  // Spawn Playwright scraper (ESM)
  const nodeExec = process.execPath; // current Node
  const scriptPath = path.join(__dirname, 'src', 'main.js');
  const env = {
    ...process.env,
    BROWSERS: String(b),
    TABS_PER_BROWSER: String(t),
    // HEADLESS can be set in process env or .env inside scraper dir
  };

  const proc = spawn(nodeExec, [scriptPath], {
    cwd: __dirname,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child = proc;
  startedAt = new Date();
  browsers = b;
  tabsPerBrowser = t;

  logsNs.emit('status', 'started');

  const emitLines = (chunk, source = 'stdout') => {
    const text = chunk.toString('utf8');
    text.split(/\r?\n/).forEach((line) => {
      if (!line) return;
      logsNs.emit('log', line);
      // Heuristic: increment progress when a query finishes
      if (/\u{1F3AF}|🎯/u.test(line) && /done/i.test(line)) {
        completedRows = Math.min(totalRows, completedRows + 1);
        logsNs.emit('progress', { completed: completedRows, total: totalRows });
      }
    });
  };

  proc.stdout.on('data', (d) => emitLines(d, 'stdout'));
  proc.stderr.on('data', (d) => emitLines(d, 'stderr'));

  const cleanup = (code, signal) => {
    logsNs.emit('log', `Scraper exited with code ${code}${signal ? ` signal ${signal}` : ''}`);
    logsNs.emit('status', 'stopped');
    child = null;
    startedAt = null;
    browsers = null;
    tabsPerBrowser = null;
    completedRows = 0;
    totalRows = 0;
  };
  proc.on('exit', cleanup);
  proc.on('close', cleanup);

  return { ok: true, pid: proc.pid };
}

function stopScraper() {
  return new Promise((resolve) => {
    if (!child) return resolve({ ok: false, reason: 'not-running' });
    const pid = child.pid;
    try {
      treeKill(pid, 'SIGTERM', (err) => {
        if (err) {
          // Try SIGKILL if SIGTERM failed
          treeKill(pid, 'SIGKILL', () => resolve({ ok: true }));
        } else {
          resolve({ ok: true });
        }
      });
    } catch (e) {
      resolve({ ok: false, reason: e.message });
    }
  });
}

// Routes
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'scraper-api' });
});

app.post('/upload-input', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' });
  try {
    // Ensure folder exists
    fs.mkdirSync(path.dirname(INPUT_CSV), { recursive: true });
    fs.writeFileSync(INPUT_CSV, req.file.buffer);
    const rows = countCsvRows(req.file.buffer);
    totalRows = rows;
    completedRows = 0;
    return res.json({ ok: true, rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/start-scraper', async (req, res) => {
  const b = Number(req.body?.browsers || req.body?.BROWSERS || req.body?.browser || 2);
  const t = Number(req.body?.tabsPerBrowser || req.body?.TABS_PER_BROWSER || req.body?.tabs || 2);
  if (child) return res.status(409).json({ status: 'already-running', pid: child.pid });
  const result = startScraper({ b, t });
  if (!result.ok) return res.status(500).json({ status: 'error', reason: result.reason });
  return res.json({ status: 'started', pid: result.pid });
});

app.post('/stop-scraper', async (_req, res) => {
  const out = await stopScraper();
  if (out.ok) return res.json({ status: 'stopped' });
  return res.status(400).json({ status: 'not-running' });
});

app.get('/status', (_req, res) => {
  res.json({
    running: !!child,
    pid: child?.pid || null,
    uptime: humanUptime(startedAt),
    browsers: browsers || null,
    tabs: tabsPerBrowser || null,
    completed: completedRows,
    total: totalRows,
  });
});

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
