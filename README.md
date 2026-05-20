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

- академические группы с формой обучения, направлением, профилем, уровнем обучения и количеством выпускников;
- расширенная анкета выпускника: статус трудоустройства, место работы, должность, продолжение обучения, полезные дисциплины и темы самостоятельного изучения;
- создание выпускников из админ-панели;
- управление партнерами главной страницы из админ-панели;
- аналитическая круговая диаграмма по статусам трудоустройства;
- PDF-отчет с пофамильным списком и процентной сводкой.

## PDF-экспорт трудоустройства

Администратор может скачать отчет из раздела аналитики или списка выпускников. Endpoint:

```text
GET /api/analytics/employment-report.pdf
```

Поддерживаются фильтры:

```text
graduation_year
academic_group
study_form
degree_level
employment_status
```

Если выбран фильтр по группе, PDF формируется только по этой группе. Если фильтр не выбран, в отчет попадают все группы и годы выпуска.

## Переменные окружения

Файл `.env.example` можно скопировать в `.env`:

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

`.env` не должен попадать в git.

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

- заменить демо-пароли и `SECRET_KEY`;
- вынести секреты в защищённое хранилище или secrets manager;
- настроить HTTPS и production CORS/CSRF origins;
- добавить CI pipeline для `python manage.py check`, `npm run lint`, `npx tsc -b`, `npm audit`, `npm run build`;
- регулярно обновлять зависимости и проверять bundle size после новых крупных страниц.
