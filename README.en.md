[English](./README.en.md) | [Русский](./README.md)

# Employment App

A monorepo for a department graduate employment tracking system.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Django, Django REST Framework, Simple JWT, PostgreSQL
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
Django admin: http://localhost/django-admin/
API: http://localhost/api/
Healthcheck: http://localhost/api/health/
Swagger: http://localhost/api/docs/
```

Containers:

```text
db       PostgreSQL
backend  Django + Gunicorn
nginx    React build + reverse proxy
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

Start PostgreSQL from Docker Compose first:

```bash
docker compose up -d db
```

Then run the backend locally:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DB_HOST=localhost python manage.py migrate
DB_HOST=localhost python manage.py seed --clear
DB_HOST=localhost python manage.py runserver
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
npm audit
npm run build
```

## npm audit

Check frontend dependency vulnerabilities:

```bash
cd frontend
npm audit
```

Apply safe compatible automatic updates:

```bash
npm audit fix
```

If vulnerabilities remain, review the `npm audit` report and update specific packages manually. Use `npm audit fix --force` only after reviewing the changes because it can install major versions with breaking changes. After any dependency update, run:

```bash
npm run lint
npx tsc -b
npm run build
```

## Code splitting

`frontend/src/App.tsx` uses route-based code splitting with `React.lazy()` and `Suspense`. This reduces the initial JavaScript bundle: admin, employer, and graduate pages are loaded as separate chunks only when the user opens the matching route.


## Department reporting features

The project is adapted for the Department of Information Systems and Technologies named after Academician A. Zhainakov. The system now includes:

- academic groups with study form, direction, profile, degree level, and graduate counts;
- an extended graduate survey: employment status, workplace, position, continuing education, useful subjects, and self-study topics;
- graduate creation from the admin panel;
- editable homepage partners from the admin panel;
- a pie chart for employment status analytics;
- a PDF report with a detailed graduate list and percentage summary.

## Employment PDF export

An administrator can download the report from the analytics page or the graduates list. Endpoint:

```text
GET /api/analytics/employment-report.pdf
```

Supported filters:

```text
graduation_year
academic_group
study_form
degree_level
employment_status
```

If a group filter is selected, the PDF is generated only for that group. If no filter is selected, all groups and graduation years are included.

## Environment variables

Copy `.env.example` to `.env`:

```dotenv
SECRET_KEY=change-me-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173

DB_NAME=employment_db
DB_USER=employment_user
DB_PASSWORD=employment_password
DB_HOST=db
DB_PORT=5432
DB_CONN_MAX_AGE=60
DB_CONN_HEALTH_CHECKS=True
```

Do not commit `.env`.

## Healthcheck

The backend healthcheck is available at:

```text
GET /api/health/
```

Successful response:

```json
{"status": "ok", "database": "ok"}
```

If PostgreSQL is unavailable, the endpoint returns HTTP `503`.

## Production recommendations

- replace demo passwords and `SECRET_KEY`;
- move secrets to a protected secrets manager;
- configure HTTPS and production CORS/CSRF origins;
- add CI for `python manage.py check`, `npm run lint`, `npx tsc -b`, `npm audit`, and `npm run build`;
- keep dependencies updated and check bundle size after adding large pages.
