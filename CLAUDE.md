# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports all 11 document types from the catalog, each filled in via an AI chat, with real per-user sign-up/login and a history of each user's completed documents. See "Implementation status" below.

## Development process

When instructed to build a feature:

1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

Note: the `:free` tier of this model was discontinued by OpenRouter; the paid slug above is required and calls incur real per-request charges on the `OPENROUTER_API_KEY` account.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:

```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

Backend available at http://localhost:8000

## Color Scheme

- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation status

- PL-7 (V1 foundation) is done: `backend/` is a uv + FastAPI project using raw `sqlite3` (no ORM); the whole app runs as a single Docker container with the frontend statically exported and served by FastAPI on port 8000; `scripts/start-*`/`stop-*` work for mac/linux/windows.
- PL-8 (AI chat) is done: document creation is filled in via a freeform AI chat (using the Cerebras skill with Structured Outputs) instead of a manual form; the AI asks fixed-order questions, extracts fields turn by turn, and tells the user once every field is filled. Chat history is not persisted (stateless backend, frontend holds it in memory).
- PL-9 (all document types) is done: all 11 document types from `catalog.json` are implemented in `frontend/lib/documents/` and selectable through the chat (the Mutual NDA and its cover page share one `mnda` module, so 11 registry slugs cover all 12 catalog entries).
- PL-10 (multi-user & final polish) is done: real signup/login with Argon2-hashed passwords (`backend/app/auth.py`), replacing the old fake login; a `documents` table persists each user's completed agreements (saved once the chat reaches `done`, updated on later corrections), browsable on a new `/documents` history page; a shared `AppShell` nav (logo, links, sign out, theme toggle) with a portal-based header-actions slot keeps page buttons like Download PDF pinned in view; the login screen is a branded two-column layout toggling between sign-in and sign-up; and an AI-drafted-content disclaimer is baked into the shared `DocumentPreview` so it shows in the app and in the printed/downloaded PDF.
- UI polish (frontend-only, no ticket, predates PL-10's shell/nav work): light/dark theme toggle (`ThemeToggle.tsx`, dark background is neutral gray, not pure black), a blurred document placeholder shown before a document type is chosen, equal-height chat/preview panes, a chat loading indicator, and auto-scroll to the newest chat message.
- Known caveat (as of 2026-07-14): the `OPENROUTER_API_KEY` account has no payment method/balance, so real AI chat calls currently fail. Pending decision: either fund the OpenRouter account to keep using Cerebras, or drop the Cerebras provider requirement and switch to one of OpenRouter's free-tier models instead (Cerebras itself has no free-tier models on OpenRouter, so this is an either/or choice, not a model swap within Cerebras).
