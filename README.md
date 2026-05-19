[English](./README.en.md) | [Русский](./README.md)

# Employment App

Монорепозиторий для системы учёта трудоустройства выпускников кафедры.

## Стек

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Django, Django REST Framework, Simple JWT, SQLite
- **Proxy:** Nginx
- **Запуск:** Docker Compose v2

## Структура проекта

```text
employment_app-main/
├── backend/                 # Django REST API
│   ├── manage.py
│   ├── requirements.txt
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
Django admin: http://localhost/admin/
API: http://localhost/api/
Swagger: http://localhost/api/docs/
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

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed --clear
python manage.py runserver
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
npm run build
```

## Переменные окружения

Файл `.env.example` можно скопировать в `.env`:

```dotenv
SECRET_KEY=change-me-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://localhost:5173
```

`.env` не должен попадать в git.

## Рекомендации для продакшена

- заменить SQLite на PostgreSQL;
- вынести секреты в защищённое хранилище или secrets manager;
- настроить HTTPS и production CORS/CSRF origins;
- добавить healthcheck endpoint для backend;
- добавить CI pipeline для `python manage.py check`, `npm run lint`, `npx tsc -b`, `npm run build`;
- настроить code splitting для frontend, потому что production bundle уже больше 500 kB.
