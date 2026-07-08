# Feature Voting Board

A lightweight full-stack feature-voting board for an internal product team.
Members sign in, propose feature ideas, and vote on the ones they support.

- **Backend** — Python · Django 6 · Django REST Framework (token auth, SQLite)
- **Frontend** — React 19 · TypeScript · Vite · TanStack Query

The design and trade-offs are documented in [SOLUTION.md](./SOLUTION.md).

---

## Features

- Token-based sign-in for a seeded user
- List ideas with vote counts, sorted by **popularity** or **most recent**
- Create ideas (title + description) — authenticated
- Vote / unvote — authenticated, **one vote per user per idea**
- **Bonus:** server-side **pagination** and **optimistic voting UX**

---

## Prerequisites

- **Python 3.13+** and [**uv**](https://docs.astral.sh/uv/) (backend)
- **Node 20+** and npm (frontend)

---

## 1. Backend (Django API)

```bash
cd backend
uv sync                              # install dependencies into .venv
uv run python manage.py migrate      # create the SQLite schema
uv run python manage.py seed_demo    # seed a demo user + sample ideas
uv run python manage.py runserver 8000
```

The API is now at **http://localhost:8000/api/**.

**Seeded login:** `demo` / `demo12345`

> `seed_demo` is idempotent — safe to re-run. You can create more users with
> `POST /api/auth/register/` or `uv run python manage.py createsuperuser`.

## 2. Frontend (React SPA)

In a second terminal:

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Open **http://localhost:5173** and sign in with the demo credentials.
The API base URL defaults to `http://localhost:8000/api` and can be overridden
with a `VITE_API_URL` environment variable.

---

## Running the tests

**Backend** (no server needed — uses a throwaway test DB):

```bash
cd backend
uv run python manage.py test api
```

**Frontend unit / integration** (Vitest):

```bash
cd frontend
npm test
```

**Frontend end-to-end** (Playwright — boots both servers automatically):

```bash
cd frontend
npx playwright install chromium      # first run only
npm run e2e
```

---

## API reference

Base URL: `/api`. Authenticated requests send `Authorization: Token <key>`.

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/auth/login/` | — | Exchange username + password for a token |
| `POST` | `/auth/register/` | — | Create an account |
| `GET` | `/ideas/` | — | List ideas (paginated, 20/page) |
| `POST` | `/ideas/` | ✅ | Create an idea |
| `GET` | `/ideas/{id}/` | — | Retrieve an idea |
| `PATCH` / `DELETE` | `/ideas/{id}/` | ✅ owner | Edit / delete an idea |
| `POST` | `/ideas/{id}/vote/` | ✅ | Cast a vote |
| `POST` | `/ideas/{id}/unvote/` | ✅ | Remove your vote |

**Sorting** — `?ordering=-vote_count` (popularity) or `?ordering=-created_at`
(most recent). **Pagination** — `?page=N`.

Example:

```bash
# Log in
curl -X POST http://localhost:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo12345"}'
# => {"token":"..."}

# Vote for idea 1
curl -X POST http://localhost:8000/api/ideas/1/vote/ \
  -H 'Authorization: Token <key>'
```

---

## Project structure

```
feature-vote/
├── backend/                 # Django project (uv-managed)
│   ├── api/                 # models, serializers, views, urls, tests
│   │   └── management/commands/seed_demo.py
│   └── config/              # settings, root urls
├── frontend/                # Vite + React + TypeScript SPA
│   └── src/
│       ├── lib/             # API client, query client, types
│       ├── features/
│       │   ├── auth/        # token auth context, login
│       │   └── ideas/       # list, vote, create, sort, pagination
│       ├── components/ui/   # Button, Field, Toast, ThemeToggle
│       └── hooks/           # URL-as-state (sort + page)
├── README.md
└── SOLUTION.md
```
