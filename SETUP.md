# Setup Guide (Non‑Technical)

Welcome! This guide will help you run the Google Email Scraper Dashboard on your computer with the fewest steps possible. No coding required.

You’ll be able to:
- Upload a CSV of search queries
- Choose how fast it runs (browsers and tabs)
- Start/Stop the scraper
- Watch live logs
- Download the results as a CSV

If you ever get stuck, check the Troubleshooting section at the bottom.


## Option A — Easiest (Recommended): Use Docker Desktop

This runs everything for you. You don’t need to install Node or browsers.

1) Install Docker Desktop for Windows
   - Download: https://www.docker.com/products/docker-desktop/
   - Open Docker Desktop and wait until it says “Running”

2) Open the project folder
   - If you downloaded a ZIP, right‑click it → Extract All… → open the folder
   - Open Windows PowerShell in the project folder (right‑click empty space → Open in Terminal)

3) Start the app
   - In PowerShell, run:

```powershell
docker compose up --build
```

4) Open the dashboard in your browser
   - Frontend (UI): http://localhost:5173
   - Backend (API): http://localhost:5000 (for reference)

5) Use the app
   - Upload your CSV file
   - Set BROWSERS and TABS PER BROWSER (higher = faster but heavier)
   - Click Start to begin; watch logs and progress
   - Click Download output.csv to get your results

6) Stop the app
   - Press Ctrl + C in the PowerShell window to stop
   - Or, in another terminal, run: `docker compose down`

Notes
- Output is stored inside the backend container; just use the “Download output.csv” button from the UI.
- If you want files saved on your PC automatically, see “Persist files with Docker (optional)” below.


## Option B — Without Docker (Manual)

Only choose this if you don’t want Docker. You’ll install Node and the Playwright browsers locally.

1) Install Node.js (LTS)
   - Download: https://nodejs.org/en (choose the LTS version)

2) Install and run the backend

```powershell
cd backend
npm ci
npx playwright install
npm run dev
```

3) In a new PowerShell window, install and run the frontend

```powershell
cd frontend
npm ci
npm run dev
```

4) Open the dashboard
- http://localhost:5173


## Prepare your CSV

- One query per line; a header row is optional.
- If you use a header, name it: query (also accepts q or search)

Examples (both are OK):

```
query
site:example.com contact email
"marketing manager" @company.com
```

```
site:example.com contact email
"marketing manager" @company.com
```


## Speed controls (BROWSERS and TABS)

- BROWSERS = how many separate browser processes
- TABS PER BROWSER = how many tabs each browser opens
- More = faster, but can trigger captchas or use more CPU/RAM. Start small (e.g., 2 × 2) and increase gradually.


## Optional: CAPTCHA (NopeCHA) and database (Supabase)

If you have these services, add your keys to `backend/.env` before starting.

- NOPECHA_API_KEY=your-key
- SUPABASE_URL=your-url
- SUPABASE_KEY=your-key

These are optional; the app works without them.


## Where are my files?

- Input file (after upload): `backend/src/input.csv`
- Output file: `backend/output.csv` (download from the UI)

### Persist files with Docker (optional)
If you want input/output to live on your PC, add volume mappings to `docker-compose.yml` under the `backend` service:

```yaml
services:
  backend:
    # ... existing config ...
    volumes:
      - ./backend/src/input.csv:/app/src/input.csv
      - ./backend/output.csv:/app/output.csv
```

Then run:

```powershell
docker compose down
docker compose up --build
```


## Troubleshooting

- “Ports already in use”
  - Another app is using port 5000 or 5173. Close it or change the port mapping in `docker-compose.yml`.

- “White screen” or UI doesn’t load
  - Wait 10–20 seconds on first run; refresh the page. Ensure Docker Desktop says “Running”.

- “Playwright browsers missing” (manual mode)
  - Run `npx playwright install` in the `backend` folder.

- Captchas or very slow progress
  - Lower BROWSERS/TABS. Consider adding a NopeCHA key in `backend/.env`.

- Can’t download output.csv in Docker
  - Ensure the backend is running and the scraper has produced results. Try again after a minute.

- Docker Desktop errors on Windows
  - Ensure WSL 2 is enabled and up to date: https://learn.microsoft.com/windows/wsl/install


## FAQ

- Can I close the browser tab?
  - Yes, but the scraper runs in the backend. Use the Stop button in the UI to stop it.

- How long will it take?
  - Depends on your CSV size and speed settings. Start small and scale up.

- Can it run without showing browser windows?
  - Yes. It runs headless by default (no visible windows).

- Is my CSV header required?
  - No. If present, it should be `query` (also accepts `q` or `search`).


## Clean up

To stop and remove containers:

```powershell
docker compose down
```

That’s it — you’re ready to go. Enjoy! 🎯
