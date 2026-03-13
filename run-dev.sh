#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PROJECT="$ROOT_DIR/backend/EscapeRoom.Api/EscapeRoom.Api.csproj"
DOCKER_COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"

BACKEND_PID=""
FRONTEND_PID=""
CLEANED_UP=0

cleanup() {
  if [[ "$CLEANED_UP" -eq 1 ]]; then
    return
  fi

  CLEANED_UP=1
  echo
  echo "Stopping dev servers..."

  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap cleanup INT TERM EXIT

if [[ -f "$DOCKER_COMPOSE_FILE" ]] && command -v docker >/dev/null 2>&1; then
  echo "Starting database container..."
  docker compose -f "$DOCKER_COMPOSE_FILE" up -d >/dev/null
fi

echo "Starting backend API..."
dotnet run --project "$BACKEND_PROJECT" &
BACKEND_PID=$!

echo "Starting frontend (Vite)..."
(
  cd "$ROOT_DIR"
  npm run dev
) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."

while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend process exited."
    break
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Frontend process exited."
    break
  fi

  sleep 1
done

cleanup
