# AI Workforce — how to run

Two processes: the FastAPI backend on port 8000 and the Vite frontend on
port 5173. Both must be running at the same time.

## 1. Backend (terminal 1)

From the `workforce` folder:

```bash
python -m venv venv
venv\Scripts\activate            # Windows
# source venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Wait for `Application startup complete.` Leave this terminal open.

Check `.env` has these before starting:

```
GEMINI_API_KEY=...
ADMIN_API_KEY=change-me-admin-key
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/callback
```

## 2. Frontend (terminal 2)

From the `workforce/frontend` folder:

```bash
npm install
npm run dev
```

Opens http://localhost:5173 automatically.

## 3. Use it

1. Watch the intro, or click to skip.
2. Name your team and the five people. Click "Take me in".
3. The header shows a green dot and "Backend connected" once the event
   stream is live. Pink means the backend isn't reachable — check terminal 1.
4. Type an instruction and click "Ask the team".
5. To connect Google Calendar, enter your Google address in the left
   panel and click "Connect calendar". Sign in in the new tab, then come
   back — the dot turns green on its own within a few seconds.

## Switching to the scripted demo

`frontend/src/AIWorkforce.jsx`, near the top:

```js
const USE_MOCK = false;   // true = 26-second scripted demo, no backend needed
```

Set it to `true` if the live backend misbehaves. The app then runs the
canned script and needs nothing else running.

## Settings that must match

| Frontend (`AIWorkforce.jsx`) | Backend (`.env`) |
|---|---|
| `API_BASE = "http://localhost:8000"` | the port uvicorn runs on |
| `ADMIN_KEY = "change-me-admin-key"` | `ADMIN_API_KEY` |

`GOOGLE_REDIRECT_URI` must also match the redirect URI registered in
Google Cloud Console exactly, character for character.

## If something doesn't work

- **Header dot is pink** — backend isn't running, or it's on a different port.
- **Nothing appears in the feed** — open the browser Network tab, find the
  `stream` request, check the EventStream view shows `workspace_id` on each event.
- **"Could not reach the backend"** — the POST to `/api/agent/task` failed;
  the error text in terminal 1 will say why.
- **Calendar connect fails** — check `ADMIN_KEY` matches `ADMIN_API_KEY`, and
  that your Google address is listed as a test user in Google Cloud Console.
