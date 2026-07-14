# Prelegal

A SaaS platform for drafting common legal agreements. Chat with an AI assistant to pick a
document type and fill in its fields, watch a live preview update as you answer, then download
a ready-to-sign PDF. Completed agreements are saved to your account so you can find them again
later.

## Features

- **AI-guided drafting** — a freeform chat asks one question at a time and extracts fields from
  your answers, instead of a long manual form.
- **11 supported document types** — Mutual NDA, Cloud Service Agreement, Design Partner
  Agreement, SLA, Professional Services Agreement, DPA, Software License Agreement, Partnership
  Agreement, Pilot Agreement, BAA, and an AI Addendum (see `catalog.json` for the full list and
  the underlying template in `templates/`).
- **Accounts and document history** — real sign-up/sign-in (Argon2-hashed passwords); every
  agreement you complete is saved and browsable on the Documents page.
- **PDF export** — download any agreement, live or from history, as a print-ready PDF.
- **Light/dark theme**, and a clear disclaimer on every generated document that it is
  AI-drafted and subject to legal review.

## Tech stack

- **Backend**: Python (uv), FastAPI, raw `sqlite3` (no ORM). The database is recreated from
  scratch every time the server boots, so there's no persistence across restarts and no
  migrations to manage.
- **Frontend**: Next.js (App Router), statically exported and served by the backend.
- **AI**: Cerebras (via LiteLLM/OpenRouter) with Structured Outputs.
- Packaged as a single Docker image; the backend serves both the API and the built frontend.

## Getting started

### Requirements

- Docker
- An OpenRouter API key with credit, for the AI chat to work

### Run it

1. Add your key to a `.env` file in the project root:
   ```
   OPENROUTER_API_KEY=sk-...
   ```
2. Start the app:
   ```bash
   # Mac / Linux
   scripts/start-mac.sh      # or scripts/start-linux.sh
   
   # Windows
   scripts/start-windows.ps1
   ```
3. Open http://localhost:8000, sign up, and start a chat.

Stop it with `scripts/stop-mac.sh` / `scripts/stop-linux.sh` / `scripts/stop-windows.ps1`.

## Development

Backend and frontend can also be run outside Docker for local development:

```bash
# Backend (http://localhost:8000)
cd backend
uv run uvicorn app.main:app --reload

# Frontend (http://localhost:3000, proxies API calls to the backend above)
cd frontend
npm install
npm run dev
```

### Tests

```bash
# Backend
cd backend && uv run pytest

# Frontend unit/component tests
cd frontend && npm run test

# Frontend end-to-end tests (builds the frontend and boots a throwaway backend)
cd frontend && npm run test:e2e
```

## Project structure

```
backend/     FastAPI app: auth, document-chat, and document-history endpoints
frontend/    Next.js app: chat UI, document preview, history page
templates/   Markdown templates for each supported agreement
catalog.json Metadata (name, description, template file) for each document type
scripts/     Start/stop scripts for Mac, Linux, and Windows
```

## Status

Actively developed. See `CLAUDE.md` for the current implementation status and known caveats.
