#!/usr/bin/env bash
# Shared implementation for stop-mac.sh/stop-linux.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose down
