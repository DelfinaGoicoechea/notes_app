# Notes App (Full Stack)

SPA notes app with a NestJS REST API backend and a React + Vite frontend.

## Runtimes / tools (tested)

- **macOS / Linux**
- **Node.js**: `v22.21.1`
- **npm**: `10.9.4`

## Tech stack

- **Backend**: NestJS `^11.0.1`, TypeORM `^0.3.28`, SQLite (`sqlite3` `^5.1.7`)
- **Frontend**: React `^19.2.5`, Vite `^8.0.9`, Axios `^1.15.2`

## One-command run

From repo root:

```bash
./run.sh
```

What it does:

- Installs dependencies in `backend/` and `frontend/`
- Creates `backend/.env` and `frontend/.env` if missing
- Starts backend + frontend (auto-picks free ports if defaults are busy)
- Opens the frontend URL in your browser (best-effort)

## URLs / ports

- **Backend default**: `http://localhost:3000` (may increment up to `3100` if busy)
- **Frontend default**: `http://localhost:5173` (may increment up to `5200` if busy)

`run.sh` prints the final URLs it chose.

## Database

- **SQLite file**: `backend/notes.db`
- **Schema creation**: automatic on backend boot via TypeORM `synchronize: true` in `backend/src/app.module.ts`

## Stop everything

In the terminal running `./run.sh`, press:

- **Ctrl+C**

This stops the frontend and the script will also stop the backend process it started.

