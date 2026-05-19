[English](./README.en.md) | [Русский](./README.md)

# Employment App

A monorepo for a department graduate employment tracking system.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Django, Django REST Framework, Simple JWT, SQLite
- **Proxy:** Nginx
- **Runtime:** Docker Compose v2

## Project structure

```text
employment_app-main/
├── backend/                 # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── employment_system/   # Django settings
│   ├── users/               # users and seed command
│   ├── alumni/              # graduate profiles
│   ├── employers/           # employers
│   ├── vacancies/           # vacancies
│   └── analytics/           # employment statistics
│
├── frontend/                # React + Vite frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── assets/          # local images
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── services/api.ts
│
├── Dockerfile.backend
├── Dockerfile.nginx
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── README.en.md
```

## Quick start with Docker

```bash
cp .env.example .env
docker compose up -d --build
```

After startup:

```text
Frontend: http://localhost/
Django admin: http://localhost/admin/
API: http://localhost/api/
Swagger: http://localhost/api/docs/
```

## Demo data seed

The seed command creates an admin user, employers, alumni, vacancies, and demo resumes.

```bash
docker compose exec backend python manage.py seed --clear
```

Demo credentials:

```text
admin: admin_aidar
password: DemoPass123!

employer: employer_tumar_tech
password: DemoPass123!

alumni: alumni_aizada_asanova
password: DemoPass123!
```

Optional flags:

```bash
docker compose exec backend python manage.py seed

docker compose exec backend python manage.py seed --clear

docker compose exec backend python manage.py seed --password NewPass123!

docker compose exec backend python manage.py seed --skip-resumes
```

## Local backend development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed --clear
python manage.py runserver
```

## Local frontend development

```bash
cd frontend
npm ci
npm run dev
```

Frontend checks:

```bash
npm run lint
npx tsc -b
npm run build
```

## Environment variables

Copy `.env.example` to `.env`:

```dotenv
SECRET_KEY=change-me-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
```

Do not commit `.env`.

## Production recommendations

- replace SQLite with PostgreSQL;
- move secrets to a protected secrets manager;
- configure HTTPS and production CORS/CSRF origins;
- add a backend healthcheck endpoint;
- add CI for `python manage.py check`, `npm run lint`, `npx tsc -b`, and `npm run build`;
- configure frontend code splitting because the production bundle is already larger than 500 kB.
