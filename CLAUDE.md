# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation supports one document type (Mutual NDA) via a client-side form, not yet AI chat, and uses a fake login rather than full user authentication or document persistence. See "Implementation status" below.

## Development process

When instructed to build a feature:

1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b:free` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

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
- Login is fake: any email/password is accepted, a user is get-or-created by email, and a session cookie is issued. There is no real credential check, password storage, or logout UI yet.
- Only the Mutual NDA document type is implemented, via a plain client-side form — not AI chat, and not the other 10 document types in the catalog.
- No AI/LLM integration yet (the Cerebras/OpenRouter setup above is not wired into any code path), and no document persistence beyond the `users`/`sessions` tables used for the fake login.
