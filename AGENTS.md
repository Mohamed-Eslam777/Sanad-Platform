# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository layout
- `backend/`: Express + Sequelize (MySQL) API, Socket.io server, Jest tests.
- `frontend/`: React + Vite SPA, Context-based auth/notifications, Socket.io client.
- `docker-compose.yml`: local production-like stack (MySQL, Redis, backend, frontend).
- `.agent/PRD.md` and `.agent/skills.md`: product/domain and engineering constraints used by prior agents.

## Core development commands
Run from repository root unless noted.

### Install
- `npm --prefix backend install`
- `npm --prefix frontend install`

### Run locally (split frontend/backend)
- Backend dev server (nodemon): `npm --prefix backend run dev`
- Frontend dev server (Vite on port 3000): `npm --prefix frontend run dev`

### Build / preview / prod run
- Frontend production build: `npm --prefix frontend run build`
- Frontend preview build: `npm --prefix frontend run preview`
- Backend production start: `npm --prefix backend start`

### Lint
- Frontend lint: `npm --prefix frontend run lint`
- Backend currently has no lint script configured in `backend/package.json`.

### Tests (backend Jest)
- Run all backend tests: `npm --prefix backend test`
- Watch mode: `npm --prefix backend run test:watch`
- Run a single test file: `npm --prefix backend test -- tests/auth-flow.test.js`
- Run one test by name: `npm --prefix backend test -- -t "login"`

### Database helpers
- Reset + reseed local DB (destructive): `npm --prefix backend run reset-db`
  - Seeds default users described in `backend/scripts/reset-db.js`.

### Docker compose stack
- Start all services: `docker compose up --build`
- Stop all services: `docker compose down`

## Environment notes
- Backend env is required for DB/JWT/SMTP/Redis behavior; see root `README.md` for variables.
- Test setup (`backend/jest.setup.js`) forces `NODE_ENV=test` and loads `backend/.env`.
- In test mode, Sequelize uses `${DB_NAME}_test` (`backend/src/config/db.js`).

## High-level architecture (big picture)

### Backend request flow and realtime integration
- Entry point is `backend/server.js`:
  - creates HTTP server from Express app (`backend/app.js`),
  - attaches Socket.io,
  - attempts Redis adapter (`@socket.io/redis-adapter`) via `src/config/redis.js` with in-memory fallback,
  - registers Socket instance into singleton `src/ioInstance.js`.
- `backend/app.js` defines middleware order that should be preserved:
  1. logging,
  2. security headers,
  3. CORS policy,
  4. endpoint-specific rate limiters (`/api/auth`, `/api/sos`, `/api/messages`),
  5. static uploads,
  6. `/api` routes,
  7. global error handler.
- API route aggregation is in `backend/src/routes/index.js` (`auth`, `users`, `requests`, `messages`, `reviews`, `sos`, `admin`, `notifications`).
- Sequelize relationships are centralized in `backend/src/models/index.js`; core domain entities are `User`, role profiles, `Request`, `Message`, `Review`, `SOSAlert`, and `Notification`.

### Realtime model
- Socket auth (`backend/src/socketHandler.js`) validates JWT and loads user before joining rooms.
- Room conventions are central to behavior:
  - `user_<id>` for private notifications,
  - `request_<id>` for per-request chat.
- Controllers emit notifications through `notifyUser(...)` in `backend/src/ioInstance.js` (persist then emit).
- Request lifecycle + notifications are mainly coordinated in `backend/src/controllers/requestController.js`.

### Frontend app composition
- `frontend/src/main.jsx` bootstraps app and auth context.
- `frontend/src/App.jsx` defines routing and protected routes, and wraps notification context around routes.
- API calls should use `frontend/src/services/api.js` (Axios instance with JWT attachment + 401 handling).
- Socket client is a singleton in `frontend/src/services/socketService.js`.
- `frontend/src/context/NotificationContext.jsx` hydrates from `/api/notifications` then merges realtime `new_notification` events.

## Repository-specific implementation constraints
Derived from `.agent/skills.md` and existing runtime code.

- Keep stack-aligned code: MySQL + Sequelize (not Mongoose patterns).
- Preserve security and middleware behavior in `backend/app.js` (helmet, rate limits, CORS, global error handler).
- Preserve socket authorization checks before joining/sending in request rooms.
- Keep room naming contract unchanged (`user_<id>`, `request_<id>`), since backend and frontend both rely on it.
- Frontend network calls should use the shared Axios instance (`frontend/src/services/api.js`) instead of ad-hoc `fetch`.
- Keep token storage key alignment across auth/api/socket layers (`sanad_token`).