[English](./README.en.md) | [Русский](./README.md)

# Employment App Монорепозиторий

Полноценная платформа для управления трудоустройством:

* **Frontend**: React + TypeScript + Vite
* **Backend**: Django REST Framework + SQLite
* **Обратный прокси**: Nginx
* **Оркестрация**: Docker & Docker Compose

Всё хранится в одном репозитории, запускается командой `docker-compose up --build` и предоставляет:

* React SPA по `/`
* Админ-панель Django по `/admin/`
* REST API Django по `/api/`

---

## 📁 Структура репозитория

```
employment_app-main/
├── Dockerfile.backend       # Сборка образа Django/Gunicorn
├── Dockerfile.nginx         # Многоступенчатая сборка: React → Nginx
├── docker-compose.yml       # Описание сервисов backend + nginx
├── nginx.conf               # Конфиг Nginx для прокси и статического контента
├── .env.example             # Пример файла переменных окружения
│
├── employment_system-main/  # Django REST backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── employment_system/   # Настройки и URL проекта
│   ├── users/               # Приложение пользователей
│   ├── alumni/              # Приложение выпускников
│   ├── employers/           # Приложение работодателей
│   ├── vacancies/           # Приложение вакансий
│   └── ...                  # Другие Django-приложения
│
└── uniproj-main/            # React + Vite + Tailwind frontend
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── pages/           # alumni/, employer/, graduate/
    │   ├── services/api.ts  # HTTP-клиент (axios)
    │   └── App.tsx, main.tsx
    └── public/              # Статические файлы
```

---

## 🚀 Быстрый старт (локально)

1. **Клонировать** репозиторий:

   ```bash
   git clone https://github.com/<ваш-акк>/employment_app.git
   cd employment_app/employment_app-main
   ```

2. \*\*Создать \*\*\`\` на основе примера:

   ```bash
   cp .env.example .env
   # Отредактировать .env: SECRET_KEY, DEBUG, ALLOWED_HOSTS и т.д.
   ```

3. **Подготовить тома для Django**:

   ```bash
   cd employment_system-main
   touch db.sqlite3
   mkdir -p media staticfiles
   chmod 660 db.sqlite3
   chmod 755 media staticfiles
   cd ..
   ```

4. **Собрать и запустить контейнеры**:

   ```bash
   docker-compose up -d --build
   ```

5. **Создать суперпользователя**:

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Открыть в браузере**:

   * SPA:   `http://localhost/`
   * Админка: `http://localhost/admin/`
   * API:   `http://localhost/api/users/`

---

## ⚙️ Конфигурация (`.env`)

Отредактируйте `.env` (пример в `.env.example`):

```dotenv
SECRET_KEY=ваш_секретный_ключ
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,ваш-домен.ru
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
```

> **Важно**: добавьте `.env` в `.gitignore`, чтобы не выкладывать секреты.

---

## 🧩 Анализ кода и рекомендации

* **Monorepo**: чёткое разделение frontend/backend.
* **Django**: DRF-сериализаторы, для продакшена сменить SQLite на PostgreSQL.
* **React**: структура `src/pages/`, централизованный API-клиент.
* **Nginx**: проксирование `/api/`, `/admin/`, `try_files` для SPA.
* **Docker**: тома монтируют код и статические файлы, рекомендую healthchecks.
* **Продакшен**: использовать Vault/секреты, настроить HTTPS, rate-limiting и CORS.

---

## 📦 Деплоймент

* **ВМ + Docker Compose** (AWS, GCP, Oracle).
* **Платформы**: Fly.io, Render.com, Railway.
* **Kubernetes**: Helm или манифесты, разделить сервисы.

---

## 🤝 Поддержка двух языков

Рекомендуется разделять README:

* `README.md` — английская версия
* `README.ru.md` — русская версия

В каждом файле добавьте ссылки:

```markdown
[English](./README.md) | [Русский](./README.ru.md)
```

Так пользователи смогут переключаться между языками.

---

## 🤝 Contributing

1. Fork & clone
2. Create feature branch
3. Commit & push
4. Open PR

---

## 📄 Лицензия

MIT. Смотрите [LICENSE](LICENSE).
