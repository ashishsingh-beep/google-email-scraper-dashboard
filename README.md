# 📧 Google Email Scraper Dashboard

A full-stack dashboard for managing and monitoring a **Playwright-based Google Email Scraper** with live logs, concurrent control, and CAPTCHA handling via **NopeCHA** — now organized into only **two folders**: `frontend/` and `backend/`.

---

## 🧩 Overview

This project combines a **React + Vite frontend** and an **Express.js backend** with integrated **Playwright automation**, enabling CSV-based query uploads, concurrent scraping, and real-time monitoring.

```
┌────────────────────────┐
│       React UI         │
│ - Upload CSV           │
│ - Set BROWSERS & TABS  │
│ - Start/Stop scraper   │
│ - Live logs + progress │
└────────────┬───────────┘
             │ REST + WebSocket
┌────────────┴───────────┐
│   Express API + Scraper │
│ - /start-scraper        │
│ - /stop-scraper         │
│ - /status               │
│ - /upload-input         │
│ - /logs (socket.io)     │
│ - Playwright automation │
│ - NopeCHA CAPTCHA solver│
└────────────────────────┘
```

---

## ⚙️ Features

* 🔄 **Start / Stop** scraper from dashboard
* 🧮 **Control concurrency** (`BROWSERS` + `TABS_PER_BROWSER`)
* 📤 **Upload CSV** queries dynamically
* 📡 **Real-time logs** via WebSocket (Socket.IO)
* 📈 **Progress tracking**
* 🤖 **NopeCHA CAPTCHA solver** integration
* ☁️ **Supabase** data storage (optional)
* 🧱 **Safe CSV I/O** (tolerant input, structured output)

---

## 🧱 Folder Structure

```
google-email-scraper-dashboard/
│
├── frontend/                          # 🖥️ React + Vite Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ControlPanel.jsx       # Concurrency controls + start/stop buttons
│   │   │   ├── UploadCSV.jsx          # CSV uploader UI
│   │   │   ├── LogViewer.jsx          # Real-time log viewer
│   │   │   ├── ProgressBar.jsx        # Scraping progress indicator
│   │   │   └── StatusCard.jsx         # Shows PID, uptime, and scraper state
│   │   ├── hooks/
│   │   │   └── useScraperSocket.js    # Custom Socket.io hook
│   │   ├── api/
│   │   │   └── scraperApi.js          # API helper functions
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles/
│   │       └── app.css
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── backend/                           # ⚙️ Express + Scraper Backend
    ├── index.js                       # Entry point (Express + Socket.IO)
    ├── routes/
    │   ├── scraper.js                 # /start, /stop, /status
    │   ├── upload.js                  # /upload-input
    ├── scraper/                       # 🤖 Playwright Scraper Logic
    │   ├── google_email_scraper.js    # Main Playwright script
    │   ├── solver.js                  # NopeCHA CAPTCHA integration
    │   ├── helpers/
    │   │   ├── readCSV.js             # CSV reader utility
    │   │   ├── saveCSV.js             # Write output CSV
    │   │   ├── supabaseClient.js      # Supabase integration
    │   │   └── limiter.js             # Bottleneck concurrency control
    │   └── config/
    │       └── scraperConfig.js       # Scraper settings (timeouts, retries)
    ├── utils/
    │   ├── processManager.js          # Manage scraper process lifecycle
    │   └── logger.js                  # Centralized log broadcasting
    ├── data/
    │   ├── input.csv                  # Uploaded input
    │   ├── output.csv                 # Scraper results
    │   └── logs/
    │       └── run_2025-10-30.log     # Daily log output
    ├── middleware/
    │   └── errorHandler.js
    ├── package.json
    └── README.md
```

---

## 🧠 Environment Variables

| Variable           | Example                   | Description                   |
| ------------------ | ------------------------- | ----------------------------- |
| `BROWSERS`         | `2`                       | Number of Playwright browsers |
| `TABS_PER_BROWSER` | `2`                       | Tabs per browser instance     |
| `SUPABASE_URL`     | `https://xyz.supabase.co` | Supabase project URL          |
| `SUPABASE_KEY`     | `your-key`                | Supabase API key              |
| `NOPECHA_API_KEY`  | `your-nopecha-key`        | CAPTCHA solver API key        |
| `HEADLESS`         | `true`                    | Run Playwright headless       |
| `PORT`             | `5000`                    | Backend server port           |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/google-email-scraper-dashboard.git
cd google-email-scraper-dashboard
```

### 2️⃣ Install Dependencies

```bash
cd backend
npm install
npm run playwright:install
cd ../frontend
npm install
```

### 3️⃣ Configure `.env`

Create `.env` in the **backend** directory:

```bash
HEADLESS=true
BROWSERS=2
TABS_PER_BROWSER=2
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-supabase-key
NOPECHA_API_KEY=your-nopecha-key
PORT=5000
```

### 4️⃣ Start Backend

```bash
cd backend
npm run dev
```

### 5️⃣ Start Frontend

```bash
cd frontend
npm run dev
```

Access your dashboard at 👉 [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Dashboard Features

| Feature                   | Description                      |
| ------------------------- | -------------------------------- |
| 📂 **Upload CSV**         | Upload query list for scraping   |
| ⚙️ **Set concurrency**    | Configure browsers and tabs      |
| ▶️ **Start/Stop scraper** | Start or stop scraping instantly |
| 🧾 **Live Logs**          | Stream real-time log updates     |
| 📊 **Progress Bar**       | Track progress dynamically       |
| 🧠 **Status Card**        | Show scraper PID, uptime, state  |

---

## 🌐 API Endpoints (Express)

| Method | Route            | Description                |
| ------ | ---------------- | -------------------------- |
| `POST` | `/start-scraper` | Start scraper with config  |
| `POST` | `/stop-scraper`  | Stop running scraper       |
| `GET`  | `/status`        | Get current scraper status |
| `POST` | `/upload-input`  | Upload input CSV           |
| `WS`   | `/logs`          | Real-time WebSocket logs   |

---

## ⚡ WebSocket Events

| Event      | Direction       | Example                         |
| ---------- | --------------- | ------------------------------- |
| `log`      | Server → Client | `"✅ [query] 5 emails found"`    |
| `progress` | Server → Client | `{ completed: 45, total: 100 }` |
| `status`   | Server → Client | `"running"` / `"stopped"`       |

---

## 🧰 Tools & Libraries

| Component | Library                           |
| --------- | --------------------------------- |
| Frontend  | React + Vite + Socket.io-client   |
| Backend   | Express + Socket.IO + Multer      |
| Scraper   | Playwright + Bottleneck + NopeCHA |
| Database  | Supabase                          |
| CSV I/O   | Node fs + fast-csv                |

---

## � Local Tips

- Run `npm run dev` inside both `backend/` and `frontend/` whenever you want to work on the project. Stop each with `Ctrl + C`.
- The backend serves logs over Socket.IO. Keep that terminal open to continue receiving updates in the UI.
- Playwright browsers are installed by `npm run playwright:install`. Re-run it if you update Playwright or switch machines.
- If ports 5000 or 5173 are busy, stop other apps or export a different `PORT` for the backend and update the frontend `.env` proxy setting.

---

## ✅ Summary

| Layer        | Purpose                              |
| ------------ | ------------------------------------ |
| **Frontend** | User interface for scraper control   |
| **Backend**  | REST API + WebSocket + Scraper logic |
| **Scraper**  | Playwright automation with NopeCHA   |
| **Storage**  | Supabase + CSV for persistent data   |

---