# --- Stage 1: build the frontend as a static export ---
FROM node:22-slim AS frontend-build
WORKDIR /repo
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY templates ./templates
COPY frontend ./frontend
RUN cd frontend && npm run build

# --- Stage 2: backend runtime, serving the API and the static frontend ---
FROM python:3.13-slim AS backend
RUN pip install --no-cache-dir uv
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev
COPY backend/app ./app
COPY --from=frontend-build /repo/frontend/out ./static

ENV STATIC_DIR=/app/static
EXPOSE 8000
CMD ["uv", "run", "--frozen", "--no-dev", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
