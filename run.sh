#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd node
require_cmd npm
require_cmd curl

ensure_env_file() {
  local path="$1"
  local content="$2"
  if [[ ! -f "$path" ]]; then
    mkdir -p "$(dirname "$path")"
    printf "%s\n" "$content" >"$path"
    echo "Created $path"
  fi
}

ensure_env_file "$BACKEND_DIR/.env" "PORT=3000"
ensure_env_file "$FRONTEND_DIR/.env" "VITE_API_URL=http://localhost:3000"

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import webbrowser; webbrowser.open('${url}')" >/dev/null 2>&1 || true
  fi
}

is_port_free() {
  local port="$1"
  node -e "
    const net = require('net');
    const tryHost = (host) => new Promise((resolve) => {
      const socket = net.connect({ host, port: ${port} });
      const finish = (inUse) => { try { socket.destroy(); } catch {} resolve(inUse); };
      socket.setTimeout(200);
      socket.once('connect', () => finish(true));
      socket.once('timeout', () => finish(false));
      socket.once('error', (err) => {
        if (err && err.code === 'ECONNREFUSED') return finish(false);
        return finish(true);
      });
    });

    (async () => {
      const inUseV4 = await tryHost('127.0.0.1');
      if (inUseV4) process.exit(1);
      const inUseV6 = await tryHost('::1');
      process.exit(inUseV6 ? 1 : 0);
    })();
  " >/dev/null 2>&1
}

pick_free_port() {
  local start="$1"
  local end="$2"
  local port
  for ((port = start; port <= end; port++)); do
    if is_port_free "$port"; then
      echo "$port"
      return 0
    fi
  done
  echo "No free port found in range ${start}-${end}." >&2
  return 1
}

BACKEND_PORT="$(pick_free_port "$BACKEND_PORT" 3100)"
FRONTEND_PORT="$(pick_free_port "$FRONTEND_PORT" 5200)"
API_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

echo "Installing backend dependencies."
(cd "$BACKEND_DIR" && npm install)

echo "Installing frontend dependencies."
(cd "$FRONTEND_DIR" && npm install)

echo "Starting backend on ${API_URL}."
(cd "$BACKEND_DIR" && PORT="$BACKEND_PORT" npm run start:dev) &
BACKEND_PID="$!"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

echo "Waiting for backend to be ready on ${API_URL}."
for _ in {1..60}; do
  if curl -fsS "${API_URL}/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

echo "Starting frontend on port ${FRONTEND_PORT}."
echo "Frontend: ${FRONTEND_URL}"
echo "Backend:  ${API_URL}"
cd "$FRONTEND_DIR"
open_url "$FRONTEND_URL" &
VITE_API_URL="$API_URL" npm run dev -- --port "$FRONTEND_PORT" --strictPort
