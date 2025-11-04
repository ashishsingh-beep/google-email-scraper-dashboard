# Setup Guide (Non‑Technical)

Welcome! This guide will help you run the Google Email Scraper Dashboard on your computer with the fewest steps possible. No coding required.

You’ll be able to:
- Upload a CSV of search queries
- Choose how fast it runs (browsers and tabs)
- Start/Stop the scraper
- Watch live logs
- Download the results as a CSV

If you ever get stuck, check the Troubleshooting section at the bottom.


## Quick Start (Windows)

1) **Install Node.js (LTS)**
  - Download from https://nodejs.org/en (choose the LTS installer) and follow the prompts.

2) **Install backend dependencies**

```powershell
cd backend
npm install
npm run playwright:install
```

3) **Add optional settings**
  - Create `backend/.env`
  - Paste any values you want to override:

```env
HEADLESS=false
BROWSERS=2
TABS_PER_BROWSER=2
SUPABASE_URL=your-url
SUPABASE_KEY=your-key
NOPECHA_API_KEY=your-nopecha-key
PORT=5000
```

4) **Start the backend**

```powershell
npm run dev
```

  Keep this window open so you can see logs.

5) **Start the frontend (new PowerShell window)**

```powershell
cd frontend
npm install
npm run dev
```

6) **Open the dashboard**
  - Visit http://localhost:5173 in your browser.

### Stopping the app
- Press `Ctrl + C` in both PowerShell windows when you are done.


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


## Troubleshooting

- “Ports already in use”
  - Another app is using port 5000 or 5173. Stop it or set a different `PORT` in `backend/.env`, then restart both backend and frontend.

- “White screen” or UI doesn’t load
  - Wait 10–20 seconds on first run, then refresh. Confirm the frontend terminal shows `VITE v... ready`.

- “Playwright browsers missing”
  - Run `npm run playwright:install` inside the `backend/` folder.

- Captchas or very slow progress
  - Lower BROWSERS/TABS. Adding a NopeCHA key in `backend/.env` also helps.

- Can’t download `output.csv`
  - Make sure the backend terminal is still running and the scraper has produced results, then click Download again.


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

- Press `Ctrl + C` in the backend PowerShell window to stop the server.
- Press `Ctrl + C` in the frontend PowerShell window to stop the UI.
- Delete the project folder when you no longer need it.

That's it — you're ready to go. Enjoy! 🎯
