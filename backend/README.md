# backend

FastAPI backend for prelegal. Serves the `/api/*` endpoints and the built
frontend static export.

## Development

```bash
uv sync
uv run pytest
uv run uvicorn app.main:app --reload --port 8000
```
