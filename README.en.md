[English](./README.en.md) | [Русский](./README.md)
# Employment App

A full-stack employment platform consisting of:

* **Frontend**: React + TypeScript + Vite
* **Backend**: Django REST Framework + SQLite
* **Reverse Proxy**: Nginx
* **Orchestration**: Docker & Docker Compose

Everything lives in one repo, runs with `docker compose up --build`, and serves:

* React SPA at `/`
* Django Admin at `/admin/`
* Django REST API under `/api/`

---

## 📁 Repository Layout

```
employment_app-main/
├── Dockerfile.backend       # Build the Django/Gunicorn image
├── Dockerfile.nginx         # Multi-stage: build React → Nginx image
├── docker-compose.yml       # Define backend + nginx services
├── nginx.conf               # Nginx proxy/static config
├── .env.example             # Example env vars
│
├── employment_system-main/  # Django REST backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── employment_system/   # Django project settings & URLs
│   ├── users/               # Custom user app
│   ├── alumni/              # Alumni app (models, serializers)
│   ├── employers/           # Employers app
│   ├── vacancies/           # Vacancies app
│   └── ...                  # other Django apps
│
└── uniproj-main/            # React + Vite + Tailwind frontend
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── pages/           # alumni/, employer/, graduate/ sub-folders
    │   ├── services/api.ts  # Axios‑based API wrapper
    │   └── App.tsx, main.tsx
    └── public/              # static assets
```

---

## 🚀 Quickstart (Local)

1. **Clone**

   ```bash
   git clone https://github.com/<your-org>/employment_app.git
   cd employment_app/employment_app-main
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   # Edit .env: set SECRET_KEY, DEBUG, ALLOWED_HOSTS (e.g., localhost,127.0.0.1)
   ```

3. **Prepare volumes**

   ```bash
   cd employment_system-main
   touch db.sqlite3
   mkdir -p media staticfiles
   chmod 660 db.sqlite3
   chmod 755 media staticfiles
   cd ..
   ```

4. **Build & Run**

   ```bash
   docker-compose up -d --build
   ```

5. **Create superuser**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Browse**

   * SPA:   `http://localhost/`
   * Admin: `http://localhost/admin/`
   * API:   `http://localhost/api/users/`

---

## ⚙️ Configuration

Edit `.env` (see `.env.example`):

```dotenv
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
```

> **Security**: Add `.env` to `.gitignore` so secrets aren’t committed.

---

## 🧩 Code Analysis & Recommendations

* **Monorepo Structure**
  Clear separation: `employment_system-main/` holds Django, `uniproj-main/` holds React.

* **Backend (Django)**

  * Uses DRF with serializers for each app (`users`, `alumni`, `employers`, `vacancies`).
  * SQLite is fine for dev; migrate to PostgreSQL/MySQL for production.
  * Consider removing unused DRF `authtoken` if using JWT exclusively.

* **Frontend (React)**

  * Organized under `src/pages/`: `alumni/`, `employer/`, `graduate/`.
  * `services/api.ts` centralizes HTTP logic—easy to swap base URL.
  * Uses Vite for fast builds; include linting/formatting in CI.

* **Nginx**

  * Proxies `/api/` and `/admin/` to Django, serves React build and static/media.
  * Uses `try_files` for SPA routing. Suggest adding HTTPS config.

* **Docker Compose**

  * Volumes mount code, static, media—enables live editing in dev.
  * Recommend healthchecks for backend (e.g., `/api/health/`) so Nginx waits until ready.

* **Security & Production**

  * Move secrets to a vault or container secrets.
  * Replace SQLite with managed DB.
  * Add rate-limiting and CORS policies on Nginx.
  * Configure HTTPS with Let’s Encrypt and auto-renewal.

---

## 📦 Deployment

* **VM (Docker Compose)**: AWS EC2, Google Compute Engine, Oracle Cloud.
* **Container Services**: Fly.io, Render.com, Railway.app.
* **Kubernetes**: Helm chart or custom manifests, splitting frontend/backend.

---

## 🤝 Contributing

1. Fork & clone
2. Create feature branch
3. Commit & push
4. Open PR

Please write tests for new endpoints or React components.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

