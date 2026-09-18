# Personal Knowledge Vault

A small, single-user full-stack app for storing notes, technical concepts,
and learning references. Built as a learning project for practicing
full-stack development and AWS deployment (EC2, RDS, S3, CloudFront).

## Stack

- **Frontend:** React (Vite)
- **Backend:** Python / Flask (REST API)
- **Database:** MySQL

## Project structure

```
knowledge-vault/
├── frontend/       React app (Vite)
├── backend/        Flask app
└── database/
    └── schema.sql  Table definitions + seed categories
```

## 1. Set up MySQL

Make sure MySQL Server is installed and running locally (MySQL 8.0+
recommended). Then create the database:

```bash
mysql -u root -p -e "CREATE DATABASE knowledge_vault;"
```

Run the schema:

```bash
mysql -u root -p knowledge_vault < database/schema.sql
```

This creates the `categories`, `tags`, `notes`, and `note_tags` tables and
seeds the predefined categories (Programming, AWS, Databases, System Design,
Books, Ideas, Other).

Don't have MySQL installed? On most systems:

```bash
# Windows: download the MySQL installer from mysql.com
# macOS
brew install mysql && brew services start mysql
# Ubuntu/Debian
sudo apt install mysql-server && sudo systemctl start mysql
```

## 2. Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your local PostgreSQL credentials

python app.py
```

The API runs on `http://localhost:5000` by default. `.env` is where the
database host/port/name/user/password, debug flag, and allowed CORS
origins live — nothing is hardcoded in the code.

Health check: `GET http://localhost:5000/api/health`

### API endpoints

```
GET    /api/notes            list notes (supports ?search=&category=&tag=)
GET    /api/notes/:id        get a single note
POST   /api/notes            create a note
PUT    /api/notes/:id        update a note
DELETE /api/notes/:id        delete a note

GET    /api/categories       list categories
GET    /api/tags             list tags

GET    /api/dashboard        totals + recent notes
```

## 3. Frontend (React)

```bash
cd frontend
npm install

cp .env.example .env
# Edit .env if your backend runs somewhere other than localhost:5000

npm run dev
```

The frontend runs on `http://localhost:5173` and talks to the backend via
`VITE_API_URL` (read from `.env`), so no backend URLs are hardcoded.

## How the frontend talks to the backend

The frontend calls a small `api.js` fetch wrapper (`frontend/src/api.js`)
which prefixes every request with `VITE_API_URL`. In development that
points at `http://localhost:5000/api`; after deployment you just change
the environment variable (e.g. to your EC2/API domain) — no code changes.

## Pages

- `/dashboard` – note/category counts, recently updated notes, "New Note" button
- `/notes` – search, category filter, tag filter, note grid
- `/notes/new` – create a note
- `/notes/:id` – view a note
- `/notes/:id/edit` – edit a note

## Deploying to AWS later

This app was intentionally kept simple so it maps cleanly onto:

```
React (built with `npm run build`)  →  S3 + CloudFront
Flask (+ gunicorn)                  →  EC2 (behind a security group / ALB)
MySQL                                →  RDS (MySQL engine)
```

No AWS SDKs or AWS-specific code are baked into the app — only environment
variables need to change between local and AWS (`DB_HOST` → RDS endpoint,
`CORS_ORIGINS` → CloudFront domain, `VITE_API_URL` → EC2/ALB domain).

## Notes on scope

This is intentionally a single-user MVP: no auth, no file uploads, no
real-time features. Authentication can be layered on top later without
changing the schema or API shape. AWS can help with the auth, or we have
other options like supabase, etc.
