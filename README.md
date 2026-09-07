# AI Workforce

An AI-powered virtual workforce on a single platform. Instead of hiring separate
people or subscribing to a dozen tools, businesses and solo founders get a team
of specialised AI agents — HR, Data Analyst, Research, and a Manager who
coordinates them — that collaborate with each other to handle recruitment,
reporting, and day-to-day operations from one place.

You describe the problem in plain language. The team handles it.

---

## What makes it a team, not a chatbot

The user only ever talks to the **Manager**. There is no agent picker and no
mode selector. The Manager decides which specialists a request needs, delegates
to them in the right order, passes each one's findings to the next, and returns
a single answer.

The specialists also talk to **each other**. HR can ask the Data Analyst for a
number mid-task. That handoff is the product — and you can watch it happen live
in the interface.

```
                        User
                          |
                     [ Manager ]
                          |
        +-----------------+-----------------+
        |                 |                 |
     [ HR ]         [ Data Analyst ]   [ Research ]
   hiring, JDs,      SQL over our       the outside
   screening,        own data           world, with
   onboarding,             ^            real links
   interviews              |
        |                  |
        +---- asks for a number ----+
```

---

## The agents

### Manager — delegation and synthesis
Splits a request into subtasks, routes each to the right specialist, and
combines their answers into one brief. It never does specialist work itself
and never invents a number — if it needs a figure, it delegates for it.

### HR — the full recruitment pipeline
Not a single-purpose tool. A working applicant tracking system:

- Writes job descriptions from a role brief
- Parses resumes (PDF and DOCX) into structured data
- Scores candidates against the JD with honest score spread
- Generates screening questions with red flags to watch for
- Books interviews against real calendar availability and emails an `.ics` invite
- Sends offer and onboarding emails
- Answers policy questions from an uploaded company handbook
- Imports live listings from public job boards

Bias guardrails are built into the prompts: age, gender, nationality, marital
status, religion and photos are excluded from every assessment.

### Data Analyst — two sources, no invented numbers
- **Recruitment database:** time-to-hire, funnel conversion, score distribution
- **Uploaded datasets:** natural language turned into real SQL, executed with
  DuckDB, then explained

Every figure comes from a query that actually ran. When the data shows *what*
happened but not *why*, it says so and names the dataset that would answer it,
rather than inventing a cause.

### Research — the outside world, with real links
Handles anything the company's own data cannot answer: market rates, salary
benchmarks, regulations, competitors, how-to questions, product comparisons,
travel options.

**The model is forbidden from writing URLs.** Links are extracted from search
results in Python and attached afterwards. Language models fabricate
plausible-looking links constantly; this design makes that impossible. Every
link in an answer came back from a search engine, so it exists.

It informs but never acts — it will find flight options and prices, then point
to the booking sites. It does not book, buy, or send anything.

### Calendar — real Google Calendar, not a mock
Connects a Google account through OAuth 2.0 and reads free/busy to place
interviews at times the interviewer is actually free. When an interview is
booked it creates a real calendar event with a Google Meet link and invites
both sides. If nobody has connected a calendar, it falls back to `.ics`
attachments silently, so the flow never breaks in a demo.

---

## The interface

A single-screen operations view. The point is that you can *see* the team work
rather than watch a spinner.

- **Roster** — every specialist with a live status light: available, working, finished
- **Path bar** — the delegation chain, drawn as work moves along it, with a page
  that flies between people on each handoff
- **Stage** — whoever is working right now, in their own colour, with what
  they're currently doing
- **Document shelf** — finished work lands here as paper cards; open one to read
  it, download as PDF, Markdown or plain text
- **Activity feed** — the raw event stream in plain language

Everything is driven by one server-sent event stream. Each event carries a
`workspace_id`, so several teams can run in parallel in separate tabs of the
same window without their events crossing.

**Naming.** You name your team and each person on it at setup. Those names are
used everywhere — the roster, the feed, the documents. The agents underneath are
still Manager, HR, Data, Research and Calendar; the interface translates.

**Languages.** English, Roman Urdu, and Chinese, switchable at any time.

---

## Architecture

Every agent is the same `BaseAgent` class with a different configuration: a
system prompt, a list of tools, and a colour. Adding a specialist means adding
a config entry and one line in the registry — not writing a new service.

```
app/
  core/
    base_agent.py      plan -> execute -> summarise loop
    llm.py             the only file that talks to a model
    events.py          event bus (database + SSE)
    embeddings.py      Gemini embeddings + ChromaDB
  agents/
    manager_agent.py   delegation and final answer
    hr_agent.py        HR config and tools
    data_agent.py      metrics + bridge to the analyst
    research_agent.py  web search with sourced links
    calendar_agent.py  reads the schedule
    registry.py        name -> agent
  tools/               the functions agents can call
  services/
    application_service.py   the recruitment state machine
    email_service.py         SMTP with console fallback
    google_calendar.py       OAuth calendar integration
    scheduler.py             background jobs
  routers/             REST API
analyst/               SQL-over-CSV engine (DuckDB)
frontend/              React + Vite single-page interface
  src/AIWorkforce.jsx  the whole app: roster, path bar, shelf, feed
scripts/               seed data and demo pipeline
```

**Every agent action emits a structured event.** The delegation tree, the live
activity feed, and the audit trail are all built from that one stream, which is
why the backend and frontend could be developed in parallel and integrated
without rework.

---

## Tech

| Layer | Choice | Why |
|---|---|---|
| Models | Gemini via LangChain | One wrapper, swappable in a single file |
| API | FastAPI | Auto-generated interactive docs |
| Frontend | React 18 + Vite | No component library — the UI is hand-built, one file, no build-time CSS step |
| Live updates | Server-sent events | One-way stream, no WebSocket handshake to manage |
| Database | SQLAlchemy — SQLite local, Postgres in production | One line to switch |
| Analytics | DuckDB | Real SQL over CSV, in-process, no server |
| Vector search | ChromaDB + Gemini embeddings | Handbook Q&A without heavy dependencies |
| Documents | pdfplumber, python-docx | Text extracted locally before any model call |
| Calendar | Google Calendar API, OAuth 2.0 | Real events and Meet links, free tier |
| Scheduling | APScheduler | Screening, job sync, and reminders in the background |
| Search | DuckDuckGo | No API key, no quota |

---

## Running it

Two processes. Both need to be running.

### 1. Backend

Python 3.11+ (3.13 works).

```bash
pip install -r requirements.txt
cp .env.example .env
```

Two values are enough to start. In `.env`:

```
GEMINI_API_KEY=...          # https://aistudio.google.com/apikey (free)
GEMINI_MODEL=gemini-3.1-flash-lite
ANALYST_MODEL=gemini-3.1-flash-lite
```

Leave `SMTP_USER` and `SMTP_PASSWORD` empty and emails print to the console
instead of sending — which is what you want while testing.

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: <http://localhost:8000/docs>

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens <http://localhost:5173>. The header shows a green dot and "Backend
connected" once the event stream is live; pink means the backend isn't
reachable.

### 3. Google Calendar (optional)

Needed only for real calendar events. In Google Cloud Console: create a
project, enable the Google Calendar API, add yourself as a test user on the
OAuth consent screen, and create a Web application OAuth client with
`http://localhost:8000/api/calendar/callback` as the redirect URI. Then in
`.env`:

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/calendar/callback
```

In the app, enter your Google address in the left panel and click "Connect
calendar". Without this, interviews still get booked — they just arrive as
`.ics` attachments instead of real events.

### Demo data

```bash
python -m scripts.seed_demo      # workspace, job, JD, 30 interview slots
python -m scripts.seed_resumes   # 12 uneven resumes: 3 strong, 5 mid, 4 weak
```

### Try it

Through the interface, or directly against `POST /api/agent/task`:

```json
{ "instruction": "Write a job description for a backend engineer" }
```

```json
{ "instruction": "What are the average salaries by job title in our dataset?" }
```

```json
{ "instruction": "What is the market rate for a backend engineer in Pakistan?" }
```

The third one is the interesting one — watch the Manager delegate to Research,
and the answer come back with real, working source links.

Live activity feed: `GET /api/events/stream`

### Offline demo mode

`frontend/src/AIWorkforce.jsx`, near the top:

```js
const USE_MOCK = false;   // true = scripted walkthrough, no backend needed
```

Set it to `true` to run the interface against a fixed script. Useful for
presenting without a network or an API key.

---

## Design decisions worth explaining

**The Manager is a pipeline, not an open-ended loop.** A free-form "the model
decides what to do next" agent is more impressive on paper and fails
unpredictably. A fixed decompose → delegate → synthesise pipeline produces the
same result and degrades gracefully — both model-dependent stages have
fallbacks, so a bad response becomes a plainer answer instead of a crash.

**One file talks to the model.** Model names get retired regularly. Because
every call goes through a single wrapper, swapping providers or models is a
config change, not a code change.

**Statistics for detection, models for language.** Anomalies are found with
plain arithmetic and explained by the model — never the other way round.

**The frontend renders events, it does not poll for state.** There is no
"get current status" endpoint. The interface is a projection of the same event
stream that writes the audit log, so what the user sees and what the system
recorded cannot drift apart.

**The interface degrades honestly.** If the backend goes down mid-task the
header says so, the send button unlocks, and the error appears in the feed in
plain language. It never sits on a spinner pretending to work.

---

## Team
TEAM LEAD = **Syed Mahmood Ejaz**

| Area | Owner |
|---|---|
| HR agent and platform backend | Ghous |
| Data Analyst engine | Areeb |
| Manager, Research agent, Calendar, integration, frontend, submission | Mahmood |
| Frontend | Musab |

Interfaces were agreed before implementation started: every agent exposes
`name`, `role`, `color`, and `run(instruction, context, task_id)`. That contract
is why four people could build in parallel and integrate in an afternoon.

---

## Next

- Feed messages in the user's chosen language (currently the backend emits one language)
- Document contents streamed to the shelf as they are written, not on completion
- Persisted teams, so a workspace survives a page reload
