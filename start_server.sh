#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${1:-8000}"

cd "${SCRIPT_DIR}"
echo "Starting Spire Jr server at http://localhost:${PORT}/spire.html"
python3 -m http.server "${PORT}"
