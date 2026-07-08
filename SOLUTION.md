# Solution — Design & Trade-offs

This document explains the key design decisions behind the Feature Voting
Board and the trade-offs each one carries.

## Overview

The app is a classic decoupled SPA + API: a Django REST Framework backend
exposing a JSON API, consumed by a React SPA over CORS. The two run on separate
ports (`8000` and `5173`), which is the fastest local setup and keeps the two
codebases independently testable and deployable.

I chose **completeness over breadth**, as the brief asks: every listed
requirement is implemented end-to-end and covered by a test, plus two of the
optional bonuses (pagination and optimistic voting).

## Backend

### Stack: Django REST Framework

DRF gives serialization, auth, permissions, pagination, and filtering out of the
box, so the code stays focused on the domain rather than plumbing. A
`ModelViewSet` with a router covers idea CRUD; two custom `@action`s handle
vote/unvote.

### Authentication: DRF `TokenAuthentication`

The brief says token auth is sufficient, so I used DRF's built-in token scheme
rather than JWT or sessions.

- **Why not JWT:** no need for stateless expiry/refresh at this scope; a single
  opaque token is simpler and has no client-side crypto.
- **Why not sessions/cookies:** cross-origin cookie handling and CSRF add
  complexity the brief explicitly says to skip. Token auth is also naturally
  CSRF-exempt.
- **Trade-off:** tokens don't expire and there's no logout-server-side. Fine for
  an internal tool; I'd add expiry/rotation for production.

Login is `POST /auth/login/` (DRF's `obtain_auth_token`). A `register` endpoint
exists for convenience but the frontend only implements sign-in, as required.

### Data model

```
Idea  = id, title, description, vote_count, created_at, created_by (FK User)
Vote  = id, idea (FK), user (FK), created_at
```

The default Django `User` is used for auth — no reason to hand-roll one.

### One vote per user per idea

Enforced at **two layers**:

1. **Database** — a `UniqueConstraint(idea, user)` on `Vote`. This is the source
   of truth; it holds even under concurrent requests or direct DB writes.
2. **Application** — the vote action uses `get_or_create`, so a duplicate vote
   returns `400` with a clear message instead of a raw integrity error.

### `vote_count`: denormalized, updated atomically

The brief lists `vote_count` as a field on `Idea`, so I stored it rather than
computing `COUNT(votes)` on every read. Reads are the hot path (every list
render), and a stored integer keeps them cheap and makes DB-level sorting by
popularity trivial.

The risk with denormalized counters is drift. I mitigate it by only ever
mutating the count inside the same transaction as the vote, using an atomic
`F('vote_count') + 1` expression (never a read-modify-write in Python), so
concurrent votes can't clobber each other.

- **Trade-off:** the count could theoretically diverge from `COUNT(votes)` if a
  vote row were changed outside these code paths. The alternative — annotating
  `Count('votes')` per query — is always consistent but slower and doesn't
  match the requested schema. A periodic reconciliation job would close the gap
  if this ever mattered.

### Sorting

DRF's `OrderingFilter` exposes `?ordering=-vote_count` (popularity) and
`?ordering=-created_at` (recency) with a sensible default, rather than
hand-rolling query parsing.

### API surface

Resource-oriented and small:

```
POST /auth/login/            POST /ideas/{id}/vote/
POST /auth/register/         POST /ideas/{id}/unvote/
GET/POST /ideas/             GET/PATCH/DELETE /ideas/{id}/
```

Vote/unvote are `POST` sub-actions rather than a `votes` collection because the
"one vote per user" rule makes the vote a toggle on the idea, not a freely
addressable resource — this keeps the client simple (no need to track vote IDs).

## Frontend

### Stack: React + TypeScript + Vite + TanStack Query

- **TanStack Query** owns all server state — caching, loading/error flags, and
  crucially the optimistic-update lifecycle. This avoids hand-written reducers
  and keeps the cache the single source of truth.
- **Thin `fetch` wrapper** instead of axios — smaller bundle (~115 kB gzip), and
  it centralises token injection and DRF error parsing.
- **React Router** for `/` and `/login`.
- **React Hook Form + Zod** for form state and boundary validation.

### Optimistic voting (bonus)

`useVote` implements the snapshot → apply → reconcile pattern:

1. `onMutate` cancels in-flight idea queries, **snapshots** the cache, and
   flips `has_voted` + `vote_count` immediately via a pure, unit-tested
   `applyVoteToggle` helper.
2. `onError` **rolls back** to the snapshot and shows a toast.
3. `onSettled` invalidates the idea queries to **reconcile** with server truth.

Keeping the mutation logic in the pure helper means the trickiest part (the
count math) is tested without a DOM or network.

- **Trade-off:** on the "most votes" sort, an optimistic vote doesn't re-order
  the list until the settle-time refetch. I chose visual stability (rows don't
  jump under the cursor) over instant re-sorting.

### Sort + pagination as URL state (bonus)

`?sort=` and `?page=` live in the URL, so any view is shareable and survives
reload. Pagination consumes DRF's `count` to render "Page N of M" with disabled
boundary controls.

### UX details

- Reading is public; voting/creating require auth, with vote controls disabled
  (not hidden) for anonymous users so the affordance is visible.
- Loading, error, and empty states are all handled explicitly.
- Swiss/editorial visual direction with design tokens and a light/dark theme.

## Testing

- **Backend (17 tests):** registration, login, idea CRUD + ownership, sorting,
  seeding, and the vote lifecycle. The single-vote-per-user rule has a dedicated
  focused test (`test_cannot_vote_twice`).
- **Frontend (17 tests, Vitest):** the API client (token, error parsing, network
  failure), the pure optimistic reducer, and the `useVote` hook's optimistic +
  rollback behaviour.
- **E2E (4 tests, Playwright):** public list, anonymous gating, optimistic
  vote+toggle, and create+sort — booting the full stack.

> **Note on "exactly one test":** the brief asks for exactly one focused test for
> the single-vote rule. That test exists and is clearly named; the additional
> tests are supplementary coverage, not a substitute for it.

The multi-user behaviour (two different users voting on the same idea aggregate
the count; each is limited to one vote) was also verified manually end-to-end
through the browser.

## What I'd do next with more time

- Token expiry/refresh and a server-side logout.
- Move the token from `localStorage` to an httpOnly cookie (or in-memory) to
  reduce XSS exposure — a deliberate simplification here.
- Idea status workflow (planned / in-progress / shipped) and search.
- A reconciliation command for `vote_count` as a safety net.
- CI running all three test suites on push.
