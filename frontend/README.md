# Feature Vote — Frontend

Vite + React + TypeScript client for the Feature Vote API. Swiss / editorial
design, TanStack Query for server state, optimistic voting.

## Prerequisites

The Django API must be running and seeded:

```bash
cd ../backend
python manage.py migrate
python manage.py seed_demo   # creates demo / demo12345 + sample ideas
python manage.py runserver 8000
```

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

The API base URL defaults to `http://localhost:8000/api` and can be overridden
with `VITE_API_URL`.

## Scripts

| Command         | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Start the dev server                              |
| `npm run build` | Type-check and build for production               |
| `npm run lint`  | Lint with oxlint                                  |
| `npm test`      | Unit/integration tests (Vitest)                   |
| `npm run e2e`   | End-to-end tests (Playwright; boots both servers) |

## Structure

```
src/
├── lib/            API client, query client, types, config
├── features/
│   ├── auth/       token auth context, login form
│   └── ideas/      list, cards, vote pill, sort, pagination, create form
├── components/ui/  Button, Field, Toast, ThemeToggle
├── hooks/          URL-as-state for sort + page
└── styles/         design tokens + global styles
```

## Notes

- **Auth**: the DRF token is stored in `localStorage`. Simple and persistent;
  readable by XSS — swap for an in-memory/cookie strategy if hardening.
- **Optimistic voting**: `useVote` flips the cached vote immediately, rolls back
  with a toast on failure, and reconciles against the server on settle.
- **URL state**: sort and page live in the query string, so views are shareable.
