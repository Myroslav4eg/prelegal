#!/usr/bin/env bash
# Shared implementation for start-mac.sh/start-linux.sh (docker compose has no
# OS-specific behavior here, so both entry points just exec this).
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up --build -d
echo "Backend available at http://localhost:8000"
