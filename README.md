[English](./README.en.md) | [Русский](./README.md)

# Employment App

Монорепозиторий для системы учёта трудоустройства выпускников кафедры.

## Стек

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Django, Django REST Framework, Simple JWT, PostgreSQL
- **Proxy:** Nginx
- **Запуск:** Docker Compose v2

## Структура проекта

```text
employment_app-main/
├── backend/                 # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml       # настройки ruff/black/mypy/pytest/bandit
│   ├── employment_system/   # настройки Django
│   ├── users/               # пользователи и seed-команда
│   ├── alumni/              # профили выпускников
│   ├── employers/           # работодатели
│   ├── vacancies/           # вакансии
│   └── analytics/           # статистика трудоустройства
│
├── frontend/                # React + Vite frontend
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── assets/          # локальные изображения
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
└── README.md
```

## Быстрый запуск через Docker

```bash
cp .env.example .env
docker compose up -d --build
```

После запуска:

```text
Frontend: http://localhost/
Django admin: http://localhost/django-admin/
API: http://localhost/api/
Healthcheck: http://localhost/api/health/
Swagger: http://localhost/api/docs/
```

Контейнеры:

```text
db       PostgreSQL
migrate  одноразовый сервис для migrate + collectstatic
backend  Django + Gunicorn
nginx    React build + reverse proxy
```

## Seed demo-данных

Команда создаёт администратора, работодателей, выпускников, вакансии и демо-резюме.

```bash
docker compose exec backend python manage.py seed --clear
```

Demo-креды:

```text
admin: admin_aidar
password: DemoPass123!

employer: employer_tumar_tech
password: DemoPass123!

alumni: alumni_aizada_asanova
password: DemoPass123!
```

Дополнительные флаги:

```bash
docker compose exec backend python manage.py seed

docker compose exec backend python manage.py seed --clear

docker compose exec backend python manage.py seed --password NewPass123!

docker compose exec backend python manage.py seed --skip-resumes
```

## Локальный запуск backend

Сначала подними PostgreSQL из Docker Compose:

```bash
docker compose up -d db
```

Потом запусти backend локально:

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

В backend добавлен `pyproject.toml` для единой настройки форматирования, линтинга, type-checking, тестов и security scan. Runtime-зависимости остаются в `backend/requirements.txt`, а инструменты разработки — в `backend/requirements-dev.txt`, чтобы production image не тащил dev-пакеты.

```bash
cd backend
pip install -r requirements-dev.txt
ruff check .
black --check .
mypy .
pytest
bandit -c pyproject.toml -r .
```

## Локальный запуск frontend

```bash
cd frontend
npm ci
npm run dev
```

Проверки frontend:

```bash
npm run lint
npx tsc -b
npm audit
npm run build
```

## npm audit

Проверить уязвимости frontend-зависимостей:

```bash
cd frontend
npm audit
```

Автоматически применить безопасные совместимые обновления:

```bash
npm audit fix
```

Если после этого уязвимости остались, смотри отчёт `npm audit` и обновляй конкретные пакеты вручную. Команду `npm audit fix --force` используй только после проверки, потому что она может поставить major-версии с breaking changes. После любых обновлений обязательно запусти:

```bash
npm run lint
npx tsc -b
npm run build
```

## Code splitting

В `frontend/src/App.tsx` настроен route-based code splitting через `React.lazy()` и `Suspense`. Это уменьшает первый JavaScript bundle: страницы админа, работодателя и выпускника загружаются отдельными chunks только при переходе на соответствующий route.


## Что добавлено для кафедральной отчетности

Проект адаптирован под кафедру «Информационные системы и технологии имени академика А. Жайнакова». В системе появились:

- академические группы с формой обучения, направлением, профилем и уровнем обучения;
- расширенная анкета выпускника: статус трудоустройства, место работы, должность, продолжение обучения, полезные дисциплины и темы самостоятельного изучения;
- создание выпускников из админ-панели;
- управление партнерами главной страницы из админ-панели;
- аналитическая круговая диаграмма по статусам трудоустройства;
- PDF-отчет с пофамильным списком и процентной сводкой.

## Экспорт отчетов по трудоустройству

Администратор может скачать отчет из раздела аналитики или списка выпускников. Поддерживаются PDF, DOCX и XLSX:

```text
GET /api/analytics/employment-report.pdf
GET /api/analytics/employment-report.docx
GET /api/analytics/employment-report.xlsx
```

Поддерживаются фильтры:

```text
graduation_year
academic_group
study_form
degree_level
employment_status
direction_code
search
```

Если выбран фильтр по группе, PDF формируется только по этой группе. Если фильтр не выбран, в отчет попадают все группы и годы выпуска.

## Переменные окружения

Файл `.env.example` можно скопировать в `.env`:

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

`.env` не должен попадать в git.


## Media files in production

Загрузка резюме и логотипов партнеров работает через Django storage. По умолчанию используется локальное хранилище `MEDIA_ROOT` в named Docker volume `media_data`. Это нормально для одного сервера или внутреннего стенда.

- резюме хранятся в `media_data`, но прямой доступ к `/media/resumes/` закрыт в Nginx; скачивание идет через защищенный API;
- логотипы партнеров хранятся в `media_data` и публично отдаются через `/media/partners/`;
- отчеты PDF/DOCX/XLSX генерируются на лету и не требуют постоянного хранения на диске.

Для публичного production с несколькими серверами лучше включить S3-совместимое хранилище:

```dotenv
MEDIA_STORAGE_BACKEND=s3
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=auto
AWS_S3_ENDPOINT_URL=https://your-s3-endpoint
AWS_S3_CUSTOM_DOMAIN=cdn.example.com
AWS_QUERYSTRING_AUTH=True
```

Также добавлены ограничения на загрузки: резюме принимаются только в PDF/DOC/DOCX, логотипы — только JPG/PNG/WEBP.

## Healthcheck

Backend healthcheck доступен по адресу:

```text
GET /api/health/
```

Успешный ответ:

```json
{"status": "ok", "database": "ok"}
```

Если PostgreSQL недоступен, endpoint возвращает HTTP `503`.

## Рекомендации для продакшена

- поставить `DJANGO_ENVIRONMENT=production`;
- заменить демо-пароли и `SECRET_KEY`;
- вынести секреты в защищённое хранилище или secrets manager;
- настроить HTTPS, production CORS/CSRF origins и включить `SECURE_SSL_REDIRECT=True`, `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`;
- после HTTPS включить HSTS (`SECURE_HSTS_SECONDS`) только на домене, где точно работает HTTPS;
- при необходимости выключить публичную документацию API через `ENABLE_API_DOCS=False`;
- запускать миграции отдельным job/service перед backend, как сделано в `docker-compose.yml` через сервис `migrate`;
- добавить CI pipeline для `python manage.py check`, `python manage.py check --deploy`, `ruff check`, `black --check`, `npm run lint`, `npx tsc -b`, `npm audit`, `npm run build`;
- регулярно обновлять зависимости и проверять bundle size после новых крупных страниц.
