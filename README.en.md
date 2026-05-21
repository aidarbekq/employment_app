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
│   ├── requirements-dev.txt
│   ├── pyproject.toml       # ruff/black/mypy/pytest/bandit settings
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
migrate  one-off migrate + collectstatic service
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


## Backend quality tools

The backend now has `pyproject.toml` for formatting, linting, type checking, tests, and security scan configuration. Runtime dependencies remain in `backend/requirements.txt`; development tools are kept in `backend/requirements-dev.txt` so the production image does not install dev-only packages.

```bash
cd backend
pip install -r requirements-dev.txt
ruff check .
black --check .
mypy .
pytest
bandit -c pyproject.toml -r .
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

- academic groups with study form, direction, profile, and degree level;
- an extended graduate survey: employment status, workplace, position, continuing education, useful subjects, and self-study topics;
- graduate creation from the admin panel;
- editable homepage partners from the admin panel;
- a pie chart for employment status analytics;
- a PDF report with a detailed graduate list and percentage summary.

## Employment report export

An administrator can download the report from the analytics page or the graduates list. PDF, DOCX, and XLSX are supported:

```text
GET /api/analytics/employment-report.pdf
GET /api/analytics/employment-report.docx
GET /api/analytics/employment-report.xlsx
```

Supported filters:

```text
graduation_year
academic_group
study_form
degree_level
employment_status
direction_code
search
```

If a group filter is selected, the PDF is generated only for that group. If no filter is selected, all groups and graduation years are included.

## Environment variables

Copy `.env.example` to `.env`:

```dotenv
DJANGO_ENVIRONMENT=development
SECRET_KEY=change-me-to-a-generated-64-character-random-secret-key-before-deploy
DEBUG=False
ENABLE_API_DOCS=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173

SECURE_SSL_REDIRECT=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_REFERRER_POLICY=same-origin
RESUME_MAX_UPLOAD_SIZE=5242880
PARTNER_LOGO_MAX_UPLOAD_SIZE=2097152
MEDIA_STORAGE_BACKEND=local
MEDIA_URL=/media/
MEDIA_ROOT=media
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=auto
AWS_S3_ENDPOINT_URL=
AWS_S3_CUSTOM_DOMAIN=
AWS_QUERYSTRING_AUTH=True

API_PAGE_SIZE=10
DRF_ANON_THROTTLE_RATE=100/hour
DRF_USER_THROTTLE_RATE=1000/hour
DRF_AUTH_THROTTLE_RATE=10/minute
DRF_PASSWORD_THROTTLE_RATE=5/minute
DRF_REPORT_THROTTLE_RATE=20/hour
JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7

GUNICORN_WORKERS=3
GUNICORN_TIMEOUT=60
DJANGO_LOG_LEVEL=INFO

DB_NAME=employment_db
DB_USER=employment_user
DB_PASSWORD=employment_password
DB_HOST=db
DB_PORT=5432
DB_CONN_MAX_AGE=60
DB_CONN_HEALTH_CHECKS=True
```

Do not commit `.env`.


## Media files in production

Resume uploads and partner logos use Django storage. By default the project uses local `MEDIA_ROOT` stored in the Docker named volume `media_data`. This is fine for a single-server deployment or an internal demo stand.

- resumes are stored in `media_data`, but direct `/media/resumes/` access is blocked in Nginx; downloads go through an authenticated API endpoint;
- partner logos are stored in `media_data` and served publicly from `/media/partners/`;
- PDF/DOCX/XLSX reports are generated on demand and are not persisted on disk.

For public production with multiple servers, enable S3-compatible storage:

```dotenv
MEDIA_STORAGE_BACKEND=s3
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=auto
AWS_S3_ENDPOINT_URL=https://your-s3-endpoint
AWS_S3_CUSTOM_DOMAIN=cdn.example.com
AWS_QUERYSTRING_AUTH=True
```

Upload validation is enabled: resumes accept only PDF/DOC/DOCX, and partner logos accept only JPG/PNG/WEBP.

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

- set `DJANGO_ENVIRONMENT=production`;
- replace demo passwords and `SECRET_KEY`;
- move secrets to a protected secrets manager;
- configure HTTPS, production CORS/CSRF origins, and enable `SECURE_SSL_REDIRECT=True`, `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`;
- enable HSTS (`SECURE_HSTS_SECONDS`) only after HTTPS is stable on the production domain;
- disable public API documentation with `ENABLE_API_DOCS=False` when it is not needed;
- run migrations as a separate job/service before backend startup, as `docker-compose.yml` does through the `migrate` service;
- add CI for `python manage.py check`, `python manage.py check --deploy`, `ruff check`, `black --check`, `npm run lint`, `npx tsc -b`, `npm audit`, and `npm run build`;
- keep dependencies updated and check bundle size after adding large pages.
