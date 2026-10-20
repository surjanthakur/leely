```
 _      _____  _____  _      __   __
| |    | ____|| ____|| |     \ \ / /
| |    |  _|  |  _|  | |      \ V /
| |___ | |___ | |___ | |___    | |
|_____||_____||_____||_____|   |_|
```

# Leely Agent

Leely helps people find good articles, blogs, and web resources quickly.
You tell it what you want to learn, and it finds useful links for you.

This project has two parts:

- Frontend: React app for the interface
- Backend: FastAPI API for search and data handling

## Project idea

Leely is built for research and reading.
Instead of opening many tabs and searching one link at a time, it helps you collect a cleaner list of useful resources.

## Main folders

```text
leely/
├── backend/      # API and search logic
├── frontend/     # website UI
├── LICENSE       # project license
└── README.md     # project overview
```

## Backend

The backend is a Python API built with FastAPI.
It handles requests, search work, and responds with useful results.

### Run backend

```bash
cd backend
cp .env.example .env
uv sync
uv run fastapi dev
```

You will need a Tavily API key in `backend/.env` for search to work.

## Frontend

The frontend is a React + Vite app.
It shows the Leely UI and connects to the backend.

### Run frontend

```bash
cd frontend
bun install
bun run dev
```

## Simple flow

1. User enters a topic or learning goal.
2. Frontend sends the request to the backend.
3. Backend searches the web.
4. Results are cleaned and shown to the user.

## Notes

- Keep real secret keys in `.env` files only.
- Do not commit private API keys.
- `backend/.env.example` is a safe template.

## Development

For local work:

- start backend
- start frontend
- test the flow from browser

This project is simple and focused on helping users read better and faster.

## build with ❤️ by surjan
