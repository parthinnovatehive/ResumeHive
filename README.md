# ResumeHive

ATS-optimized resume builder — built with Next.js 14 + FastAPI.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the API runs on http://localhost:8000.

### Health check

```bash
curl http://localhost:8000/health
# → {"status":"ok","database":"connected"}
```

### Switching to PostgreSQL

Change only the `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/resumehive
```

No code changes needed.

## Project Structure

```
resumehive/
├── frontend/           Next.js 14 (App Router)
│   ├── app/            Pages organized by feature
│   ├── components/     UI + feature-specific components
│   └── lib/            API client, hooks, utils
├── backend/            FastAPI
│   ├── app/
│   │   ├── core/       Config, security (shared infra)
│   │   ├── db/         SQLAlchemy engine + session
│   │   ├── shared/     Common Pydantic schemas
│   │   └── modules/    Feature modules (auth, resumes, ...)
│   ├── alembic/        DB migrations (not yet run)
│   └── storage/        Generated PDFs (gitignored)
└── README.md
```

Each feature module owns its router, models, schemas, and service — nothing shared across features except through `core/` and `shared/`.
