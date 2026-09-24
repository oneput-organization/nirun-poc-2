# Oneput

A native Next.js reimplementation of the supplied Oneput prototype, with a small FastAPI + SQLite backend. The application does not serve, embed, fetch, or interpret `Oneput.html`. That file is retained only as the original reference. Fonts and logo images are local assets.

## Run with Docker

```sh
docker compose up --build -d
```

- App: http://localhost:3000
- FastAPI docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

Choose **Look around on my own**, then **Admin** or **Member**. The guide launcher can replay either walkthrough. Data, uploads, and generated exports persist in the `oneput-data` Docker volume.

```sh
docker compose logs -f
docker compose down
```

`down` preserves the data volume. Ports 3000 and 8000 must be available; change the host ports in `docker-compose.yml` if another app already uses them.

## Structure

```text
frontend/
  src/app/                 Next.js App Router pages, metadata, styles, API proxy
  src/components/screens/  Sign-in, projects, planning, overview, calendar,
                           people/systems, audit, export, member onboarding/workspace
  src/components/overlays/ Settings, invitations, decisions, forms, guided tours
  src/components/layout/   Project header, assistant panel, role switcher
  src/components/          Workspace controller, API actions, context, shared UI
  src/data/                Guided walkthrough definitions
  src/lib/                 API client and workspace view model
  public/assets/           Original logos and locally hosted fonts
  tests/                   Browser integration tests
backend/
  app/main.py              Validated FastAPI endpoints and demo sessions
  app/database.py          SQLite repository and initial dataset
  app/models.py            Request schemas
  app/auth.py              Session and role checks
  app/exports.py           CSV, XLSX, HTML, DOCX, PDF, and PPTX generation
  app/seed.json             Initial prototype projects, points, members, audit queue
  tests/                   API integration tests
```

## Implemented flows

The original visual layouts, responsive breakpoints, admin/member role switch, Thai accountant persona, notification menus, project filters, planning checklist, coverage matrix and drawers, calendar/dependency warning, member detail, audit variants, settings tabs, export options, and both guided tours are implemented as React components.

The backend supports demo sessions; project creation and archiving; adding data points and members; accepting, rejecting, re-asking, and overriding answers with retained history; decisions for unrecoverable data; persisted preferences and tracker confirmations; local conversations; evidence upload/download (20 MB per file); real export files; and revocable read-only share links. Closed periods reject mutations. Planning, uploaded evidence, and navigation survive a page refresh.

For the Thai member view, open `/?persona=accountant`, dismiss the welcome, and choose Member. Tours also support `/?guide=overview`, `/?guide=how`, and a one-based `step` query parameter.

This is a local proof of concept. **Sign-in is deliberately a demo role selector**, including the prototype's Google/Microsoft buttons. AI replies use deterministic local rules; no LLM credentials are required. Email, Line, Slack, Teams, and system integrations retain their UI, but outbound work is stored in a local activity/outbox record and source configuration is saved locally. No external messages are sent and no provider is connected. Production identity, organization isolation, provider OAuth, background delivery workers, and document extraction are future integration work. Existing narrative/sample values are demo fixtures. The three historical export entries are seeded as real downloadable files, including a revocable example share link.

## Local development

Use Node.js 22+ and Python 3.12+.

Backend, in one terminal:

```sh
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend, in another:

```sh
cd frontend
npm ci
npm run dev
```

Set `API_INTERNAL_URL` in the frontend process environment or `frontend/.env.local` if the backend uses another address. The browser talks to the Next.js `/api` proxy, so there is no browser CORS configuration or baked-in public backend URL.

## Verification

```sh
cd backend
.venv/bin/python -m pytest tests -q
```

With both services running:

```sh
cd frontend
npm run build
npx playwright install chromium
npm run test:e2e
```

Set `APP_URL` to test a different frontend address. Browser tests create demo records in the running database; use a separate Compose project/volume for a clean test environment. Backend tests use isolated temporary databases and files.

Deployment follows [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output); the backend uses the standard SQLite approach described in the [FastAPI database guide](https://fastapi.tiangolo.com/tutorial/sql-databases/).

Detailed results and repeatable screenshot comparison commands are in [docs/verification.md](docs/verification.md).
