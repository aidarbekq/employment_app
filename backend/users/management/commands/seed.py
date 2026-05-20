from __future__ import annotations

from decimal import Decimal
from contextlib import contextmanager
from typing import Any, Iterator

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from django.db.models.signals import post_delete

from alumni.models import AcademicGroup, AlumniProfile
from employers.models import Employer, Partner
from employers.signals import delete_employer_user
from vacancies.models import Vacancy

User = get_user_model()

DEFAULT_PASSWORD = "DemoPass123!"


GROUPS: list[dict[str, Any]] = [
    {
        "name": "ИСТТ-1-21",
        "graduation_year": 2026,
        "direction_code": "710200",
        "direction_name": "Информационные системы и технологии",
        "profile": "Информационные системы и технологии в телекоммуникациях",
        "study_form": AcademicGroup.StudyForm.FULL_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
    {
        "name": "ИСТ-1-21",
        "graduation_year": 2026,
        "direction_code": "710200",
        "direction_name": "Информационные системы и технологии",
        "profile": "Программное обеспечение информационных систем",
        "study_form": AcademicGroup.StudyForm.FULL_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
    {
        "name": "ПЗИдот-1-21",
        "graduation_year": 2026,
        "direction_code": "690300",
        "direction_name": "Инфокоммуникационные технологии и системы связи",
        "profile": "Программно-защищенные инфокоммуникации",
        "study_form": AcademicGroup.StudyForm.PART_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
    {
        "name": "ИСТТдот-1-20",
        "graduation_year": 2025,
        "direction_code": "710200",
        "direction_name": "Информационные системы и технологии",
        "profile": "Информационные системы и технологии в телекоммуникациях",
        "study_form": AcademicGroup.StudyForm.PART_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
    {
        "name": "ИСТд-1-20",
        "graduation_year": 2024,
        "direction_code": "710200",
        "direction_name": "Информационные системы и технологии",
        "profile": "Программное обеспечение информационных систем",
        "study_form": AcademicGroup.StudyForm.PART_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
    {
        "name": "ИСТТ-1-20",
        "graduation_year": 2023,
        "direction_code": "710200",
        "direction_name": "Информационные системы и технологии",
        "profile": "Информационные системы и технологии в телекоммуникациях",
        "study_form": AcademicGroup.StudyForm.FULL_TIME,
        "degree_level": AcademicGroup.DegreeLevel.BACHELOR,
    },
]

EMPLOYERS: list[dict[str, Any]] = [
    {
        "username": "employer_tumar_tech",
        "email": "hr@tumar-tech.demo.local",
        "first_name": "Мирбек",
        "last_name": "Касымалиев",
        "company_name": "ОсОО «Тумар Тех»",
        "address": "г. Бишкек, ул. Исанова, 42, офис 301",
        "phone": "+996 555 120 101",
        "description": (
            "Вымышленная кыргызстанская IT-компания, которая разрабатывает веб-системы, "
            "личные кабинеты и интеграции для образовательных и коммерческих организаций."
        ),
    },
    {
        "username": "employer_alatoo_digital",
        "email": "jobs@alatoo-digital.demo.local",
        "first_name": "Айсулуу",
        "last_name": "Эргешова",
        "company_name": "ОсОО «Ала-Тоо Digital»",
        "address": "г. Бишкек, пр. Манаса, 88, бизнес-центр «Келечек»",
        "phone": "+996 700 418 220",
        "description": (
            "Финтех-студия полного цикла: проектирование API, мобильные приложения, "
            "аналитические панели и автоматизация внутренних бизнес-процессов."
        ),
    },
    {
        "username": "employer_kyyalsoft",
        "email": "hr@kyyalsoft.demo.local",
        "first_name": "Руслан",
        "last_name": "Токтобаев",
        "company_name": "ОсОО «КыялСофт»",
        "address": "г. Ош, ул. Курманжан Датка, 17",
        "phone": "+996 777 604 330",
        "description": (
            "Вымышленная продуктовая компания, создающая EdTech-платформы, CRM-системы "
            "и сервисы электронного документооборота для малого бизнеса."
        ),
    },
    {
        "username": "employer_naryn_systems",
        "email": "career@naryn-systems.demo.local",
        "first_name": "Бактыгүл",
        "last_name": "Осмонова",
        "company_name": "ОсОО «Нарын Systems»",
        "address": "г. Нарын, ул. Токтогула, 12",
        "phone": "+996 550 810 221",
        "description": (
            "Региональная IT-команда, специализирующаяся на внедрении учетных систем, "
            "поддержке баз данных и сопровождении корпоративной инфраструктуры."
        ),
    },
    {
        "username": "employer_manas_cloud",
        "email": "people@manas-cloud.demo.local",
        "first_name": "Кубанычбек",
        "last_name": "Мамбетов",
        "company_name": "ОсОО «Манас Cloud»",
        "address": "г. Бишкек, ул. Байтик Баатыра, 65",
        "phone": "+996 999 305 404",
        "description": (
            "Облачный провайдер для учебных проектов и стартапов: виртуальные серверы, "
            "резервное копирование, мониторинг и DevOps-консалтинг."
        ),
    },
    {
        "username": "employer_saryozon_data",
        "email": "hr@saryozon-data.demo.local",
        "first_name": "Жылдыз",
        "last_name": "Абдыкадырова",
        "company_name": "ОсОО «Сары-Өзөн Data»",
        "address": "г. Кара-Балта, ул. Панфилова, 9",
        "phone": "+996 708 909 515",
        "description": (
            "Аналитическая компания, работающая с BI-дашбордами, отчетностью, "
            "визуализацией данных и автоматизацией управленческой аналитики."
        ),
    },
    {
        "username": "employer_yntymak_telecom",
        "email": "vacancy@yntymak-telecom.demo.local",
        "first_name": "Эрмек",
        "last_name": "Сатыбалдиев",
        "company_name": "ОсОО «Ынтымак Telecom»",
        "address": "г. Жалал-Абад, ул. Барпы, 24",
        "phone": "+996 552 460 707",
        "description": (
            "Вымышленный оператор телеком-сервисов: обслуживание сетевого оборудования, "
            "мониторинг каналов связи и техническая поддержка клиентов."
        ),
    },
    {
        "username": "employer_akshumkar_lab",
        "email": "team@akshumkar-lab.demo.local",
        "first_name": "Нурзада",
        "last_name": "Жээнбекова",
        "company_name": "ОсОО «Ак-Шумкар Lab»",
        "address": "г. Бишкек, ул. Ахунбаева, 119, коворкинг «Ордо»",
        "phone": "+996 706 770 818",
        "description": (
            "Лаборатория цифровых продуктов: UX/UI, frontend-разработка, мобильные "
            "интерфейсы и прототипирование сервисов для социальных проектов."
        ),
    },
]


PARTNERS: list[dict[str, Any]] = [
    {"name": "ОсОО «Тумар Тех»", "slug": "tumar-tech", "employer_username": "employer_tumar_tech", "website": "https://tumar-tech.demo.local", "order": 10, "description": "Партнер кафедры по backend-разработке и стажировкам."},
    {"name": "ОсОО «Ала-Тоо Digital»", "slug": "alatoo-digital", "employer_username": "employer_alatoo_digital", "website": "https://alatoo-digital.demo.local", "order": 20, "description": "Финтех-партнер для вакансий frontend и API-аналитики."},
    {"name": "ОсОО «Ынтымак Telecom»", "slug": "yntymak-telecom", "employer_username": "employer_yntymak_telecom", "website": "https://yntymak-telecom.demo.local", "order": 30, "description": "Партнер по телеком-направлению, мониторингу и сетевой поддержке."},
    {"name": "ОсОО «Манас Cloud»", "slug": "manas-cloud", "employer_username": "employer_manas_cloud", "website": "https://manas-cloud.demo.local", "order": 40, "description": "Партнер по DevOps, облачной инфраструктуре и контейнеризации."},
    {"name": "ОсОО «Сары-Өзөн Data»", "slug": "saryozon-data", "employer_username": "employer_saryozon_data", "website": "https://saryozon-data.demo.local", "order": 50, "description": "Партнер по BI-аналитике, отчетности и визуализации данных."},
    {"name": "ОсОО «Ак-Шумкар Lab»", "slug": "akshumkar-lab", "employer_username": "employer_akshumkar_lab", "website": "https://akshumkar-lab.demo.local", "order": 60, "description": "Партнер по UX/UI, прототипированию и социальным цифровым продуктам."},
]


ALUMNI: list[dict[str, Any]] = [
    {
        "username": "alumni_aizada_asanova",
        "email": "aizada.asanova@graduate.demo.local",
        "first_name": "Айзада",
        "last_name": "Асанова",
        "graduation_year": 2026,
        "specialty": "Информационные системы и технологии в телекоммуникациях",
        "is_employed": True,
        "employer_username": "employer_tumar_tech",
        "position": "Python/Django backend-разработчик",
        "skills": "Django REST Framework, PostgreSQL, Docker, REST API, Git",
    },
    {
        "username": "alumni_nurbol_abdykadyrov",
        "email": "nurbol.abdykadyrov@graduate.demo.local",
        "first_name": "Нурбол",
        "last_name": "Абдыкадыров",
        "graduation_year": 2026,
        "specialty": "Информационные системы и технологии",
        "is_employed": True,
        "employer_username": "employer_alatoo_digital",
        "position": "Frontend-разработчик React",
        "skills": "React, TypeScript, Tailwind CSS, Vite, Axios",
    },
    {
        "username": "alumni_sezim_altynbekova",
        "email": "sezim.altynbekova@graduate.demo.local",
        "first_name": "Сезим",
        "last_name": "Алтынбекова",
        "graduation_year": 2026,
        "specialty": "Программная инженерия информационных систем",
        "is_employed": True,
        "employer_username": "employer_kyyalsoft",
        "position": "QA-инженер",
        "skills": "Manual QA, Postman, тест-кейсы, баг-репорты, базовый SQL",
    },
    {
        "username": "alumni_bakyt_toktogulov",
        "email": "bakyt.toktogulov@graduate.demo.local",
        "first_name": "Бакыт",
        "last_name": "Токтогулов",
        "graduation_year": 2025,
        "specialty": "Информационные системы в телекоммуникациях",
        "is_employed": True,
        "employer_username": "employer_yntymak_telecom",
        "position": "Инженер по мониторингу сетей",
        "skills": "TCP/IP, Linux, Zabbix, сетевые журналы, техническая поддержка",
    },
    {
        "username": "alumni_aidana_ergesheva",
        "email": "aidana.ergesheva@graduate.demo.local",
        "first_name": "Айдана",
        "last_name": "Эргешева",
        "graduation_year": 2025,
        "specialty": "Аналитика данных и информационные системы",
        "is_employed": True,
        "employer_username": "employer_saryozon_data",
        "position": "Junior data analyst",
        "skills": "Excel, SQL, Power BI, Python, визуализация данных",
    },
    {
        "username": "alumni_jomart_myrzabekov",
        "email": "jomart.myrzabekov@graduate.demo.local",
        "first_name": "Жоомарт",
        "last_name": "Мырзабеков",
        "graduation_year": 2025,
        "specialty": "Сетевые технологии и информационная безопасность",
        "is_employed": True,
        "employer_username": "employer_manas_cloud",
        "position": "DevOps-стажер",
        "skills": "Docker, Nginx, Linux, CI/CD, базовый Kubernetes",
    },
    {
        "username": "alumni_elnura_mamatova",
        "email": "elnura.mamatova@graduate.demo.local",
        "first_name": "Элнура",
        "last_name": "Маматова",
        "graduation_year": 2025,
        "specialty": "Информационные системы и технологии",
        "is_employed": False,
        "employer_username": None,
        "position": "Ищет позицию Junior business analyst",
        "skills": "BPMN, сбор требований, Figma, документация, SQL",
    },
    {
        "username": "alumni_ulan_asan_uulu",
        "email": "ulan.asan-uulu@graduate.demo.local",
        "first_name": "Улан",
        "last_name": "Асан уулу",
        "graduation_year": 2025,
        "specialty": "Информационные системы в телекоммуникациях",
        "is_employed": False,
        "employer_username": None,
        "position": "Ищет позицию Junior network engineer",
        "skills": "Cisco Packet Tracer, TCP/IP, Linux, диагностика сети",
    },
    {
        "username": "alumni_akylai_jumalyeva",
        "email": "akylai.jumalyeva@graduate.demo.local",
        "first_name": "Акылай",
        "last_name": "Жумалиева",
        "graduation_year": 2024,
        "specialty": "Программная инженерия информационных систем",
        "is_employed": True,
        "employer_username": "employer_akshumkar_lab",
        "position": "UX/UI designer",
        "skills": "Figma, дизайн-системы, прототипирование, пользовательские сценарии",
    },
    {
        "username": "alumni_kanykei_omurbekova",
        "email": "kanykei.omurbekova@graduate.demo.local",
        "first_name": "Каныкей",
        "last_name": "Омурбекова",
        "graduation_year": 2024,
        "specialty": "Информационные системы и технологии",
        "is_employed": False,
        "employer_username": None,
        "position": "Ищет позицию Junior frontend-разработчик",
        "skills": "HTML, CSS, JavaScript, React, адаптивная верстка",
    },
    {
        "username": "alumni_saltanat_tursunbaeva",
        "email": "saltanat.tursunbaeva@graduate.demo.local",
        "first_name": "Салтанат",
        "last_name": "Турсунбаева",
        "graduation_year": 2024,
        "specialty": "Кибербезопасность информационных систем",
        "is_employed": True,
        "employer_username": "employer_yntymak_telecom",
        "position": "Специалист технической поддержки L2",
        "skills": "Service Desk, Linux, базовая безопасность, SLA, документация",
    },
    {
        "username": "alumni_dastan_baiyshev",
        "email": "dastan.baiyshev@graduate.demo.local",
        "first_name": "Дастан",
        "last_name": "Байышев",
        "graduation_year": 2024,
        "specialty": "Аналитика данных и информационные системы",
        "is_employed": True,
        "employer_username": "employer_saryozon_data",
        "position": "BI-разработчик",
        "skills": "SQL, Power BI, ETL, DAX, построение отчетов",
    },
    {
        "username": "alumni_meder_kydyraliev",
        "email": "meder.kydyraliev@graduate.demo.local",
        "first_name": "Медер",
        "last_name": "Кыдыралиев",
        "graduation_year": 2023,
        "specialty": "Информационные системы в телекоммуникациях",
        "is_employed": True,
        "employer_username": "employer_naryn_systems",
        "position": "Системный аналитик",
        "skills": "UML, BPMN, REST API, подготовка ТЗ, моделирование данных",
    },
    {
        "username": "alumni_aibek_talantbekov",
        "email": "aibek.talantbekov@graduate.demo.local",
        "first_name": "Айбек",
        "last_name": "Талантбеков",
        "graduation_year": 2023,
        "specialty": "Информационные системы и технологии",
        "is_employed": True,
        "employer_username": "employer_tumar_tech",
        "position": "Fullstack-разработчик",
        "skills": "Django, React, TypeScript, PostgreSQL, Git",
    },
    {
        "username": "alumni_dinara_sarieva",
        "email": "dinara.sarieva@graduate.demo.local",
        "first_name": "Динара",
        "last_name": "Сариева",
        "graduation_year": 2023,
        "specialty": "Кибербезопасность информационных систем",
        "is_employed": False,
        "employer_username": None,
        "position": "Ищет позицию Junior security analyst",
        "skills": "OWASP, Linux, базовый Python, анализ журналов, документация",
    },
    {
        "username": "alumni_timur_sheraliev",
        "email": "timur.sheraliev@graduate.demo.local",
        "first_name": "Тимур",
        "last_name": "Шералиев",
        "graduation_year": 2022,
        "specialty": "Программная инженерия информационных систем",
        "is_employed": True,
        "employer_username": "employer_manas_cloud",
        "position": "Backend-разработчик API",
        "skills": "Python, DRF, Celery, Redis, Docker",
    },
    {
        "username": "alumni_nursultan_bekbolotov",
        "email": "nursultan.bekbolotov@graduate.demo.local",
        "first_name": "Нурсултан",
        "last_name": "Бекболотов",
        "graduation_year": 2022,
        "specialty": "Информационные системы в телекоммуникациях",
        "is_employed": True,
        "employer_username": "employer_yntymak_telecom",
        "position": "Инженер эксплуатации сети",
        "skills": "Маршрутизация, мониторинг, Linux, технические регламенты",
    },
    {
        "username": "alumni_cholpon_kalykova",
        "email": "cholpon.kalykova@graduate.demo.local",
        "first_name": "Чолпон",
        "last_name": "Калыкова",
        "graduation_year": 2022,
        "specialty": "Аналитика данных и информационные системы",
        "is_employed": False,
        "employer_username": None,
        "position": "Ищет позицию Junior data analyst",
        "skills": "SQL, Python, pandas, визуализация, английский B1",
    },
]


VACANCIES: list[dict[str, Any]] = [
    {
        "employer_username": "employer_tumar_tech",
        "title": "Python/Django backend-разработчик",
        "description": (
            "Разработка REST API для платформ учета выпускников, настройка сериализаторов, "
            "фильтрации и административных сценариев."
        ),
        "requirements": "Python, Django REST Framework, SQL, Git, понимание JWT-аутентификации.",
        "location": "Бишкек, гибрид",
        "salary": "65000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_tumar_tech",
        "title": "Fullstack-разработчик React + Django",
        "description": (
            "Поддержка клиентской и серверной частей веб-приложений, интеграция API, "
            "улучшение пользовательских кабинетов."
        ),
        "requirements": "React, TypeScript, Django, REST API, Docker, ответственность за качество кода.",
        "location": "Бишкек",
        "salary": "78000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_tumar_tech",
        "title": "Стажер-разработчик информационных систем",
        "description": "Участие в учебных и коммерческих проектах под руководством наставника.",
        "requirements": "Базовый Python или JavaScript, Git, желание развиваться в веб-разработке.",
        "location": "Бишкек, офис",
        "salary": "28000.00",
        "is_active": False,
    },
    {
        "employer_username": "employer_alatoo_digital",
        "title": "Frontend-разработчик React",
        "description": "Создание адаптивных интерфейсов для финтех-сервисов и внутренних кабинетов.",
        "requirements": "React, TypeScript, Tailwind CSS, Axios, аккуратная работа с компонентами.",
        "location": "Бишкек, гибрид",
        "salary": "70000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_alatoo_digital",
        "title": "Junior API analyst",
        "description": "Описание API-контрактов, тестирование интеграций и подготовка технической документации.",
        "requirements": "Postman, REST, базовый SQL, внимательность, грамотное оформление требований.",
        "location": "Бишкек",
        "salary": "45000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_kyyalsoft",
        "title": "QA-инженер веб-приложений",
        "description": "Функциональное тестирование EdTech-платформ, составление чек-листов и баг-репортов.",
        "requirements": "Тест-кейсы, Postman, Chrome DevTools, базовое понимание клиент-серверной архитектуры.",
        "location": "Ош, удаленно/офис",
        "salary": "52000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_kyyalsoft",
        "title": "Project coordinator",
        "description": "Координация задач между аналитиками, разработчиками и заказчиками образовательных проектов.",
        "requirements": "Коммуникабельность, Jira/Trello, грамотная письменная речь, понимание жизненного цикла ПО.",
        "location": "Ош",
        "salary": "48000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_naryn_systems",
        "title": "Системный аналитик",
        "description": "Сбор требований, описание бизнес-процессов и подготовка спецификаций для учетных систем.",
        "requirements": "UML/BPMN, интервьюирование пользователей, документация, базовый SQL.",
        "location": "Нарын, гибрид",
        "salary": "60000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_naryn_systems",
        "title": "Специалист поддержки баз данных",
        "description": "Сопровождение справочников, контроль корректности данных, подготовка выгрузок и отчетов.",
        "requirements": "SQL, Excel, внимательность, понимание структуры данных и резервного копирования.",
        "location": "Нарын",
        "salary": "42000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_manas_cloud",
        "title": "DevOps-стажер",
        "description": "Настройка контейнеров, Nginx, CI/CD и мониторинга для учебных и стартап-проектов.",
        "requirements": "Linux, Docker, Git, базовое понимание сетей и HTTP.",
        "location": "Бишкек, гибрид",
        "salary": "50000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_manas_cloud",
        "title": "Инженер облачной поддержки",
        "description": "Помощь клиентам с виртуальными серверами, резервными копиями и базовым мониторингом.",
        "requirements": "Linux CLI, Nginx, базовые знания DNS, ответственность и аккуратность.",
        "location": "Бишкек",
        "salary": "62000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_saryozon_data",
        "title": "Junior data analyst",
        "description": "Подготовка управленческих отчетов, построение BI-дашбордов и анализ показателей клиентов.",
        "requirements": "SQL, Excel/Google Sheets, Power BI или аналог, базовый Python приветствуется.",
        "location": "Кара-Балта, удаленно",
        "salary": "55000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_saryozon_data",
        "title": "BI-разработчик",
        "description": "Проектирование витрин данных, настройка показателей и визуализация аналитики.",
        "requirements": "SQL, Power BI, DAX, понимание ETL и качества данных.",
        "location": "Бишкек/Кара-Балта",
        "salary": "72000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_yntymak_telecom",
        "title": "Инженер мониторинга телеком-сети",
        "description": "Контроль доступности оборудования, анализ инцидентов и ведение журналов сетевых событий.",
        "requirements": "TCP/IP, маршрутизация, Linux, Zabbix или аналогичные системы мониторинга.",
        "location": "Жалал-Абад",
        "salary": "64000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_yntymak_telecom",
        "title": "Специалист технической поддержки L1",
        "description": "Прием обращений пользователей, первичная диагностика и передача сложных инцидентов инженерам.",
        "requirements": "Грамотная речь, базовые сети, стрессоустойчивость, умение работать по регламенту.",
        "location": "Жалал-Абад, сменный график",
        "salary": "38000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_yntymak_telecom",
        "title": "Стажер по сетевой безопасности",
        "description": "Анализ логов, подготовка отчетов по событиям безопасности и участие в настройке правил доступа.",
        "requirements": "Linux, основы ИБ, внимательность, базовый Python будет плюсом.",
        "location": "Жалал-Абад",
        "salary": "32000.00",
        "is_active": False,
    },
    {
        "employer_username": "employer_akshumkar_lab",
        "title": "UX/UI designer",
        "description": "Проектирование интерфейсов веб-сервисов, подготовка макетов, прототипов и дизайн-систем.",
        "requirements": "Figma, понимание UX, работа с компонентами, портфолио учебных или коммерческих проектов.",
        "location": "Бишкек, гибрид",
        "salary": "58000.00",
        "is_active": True,
    },
    {
        "employer_username": "employer_akshumkar_lab",
        "title": "Mobile frontend intern",
        "description": "Помощь в разработке интерфейсов мобильных и адаптивных веб-приложений.",
        "requirements": "JavaScript, React, основы адаптивной верстки, готовность учиться у наставника.",
        "location": "Бишкек",
        "salary": "30000.00",
        "is_active": True,
    },
]


class Command(BaseCommand):
    help = "Seeds the database with realistic demo data for the employment app."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded demo users, profiles, employers and vacancies before creating data.",
        )
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help=f"Password for all demo users. Default: {DEFAULT_PASSWORD}",
        )
        parser.add_argument(
            "--skip-resumes",
            action="store_true",
            help="Do not create demo resume files in MEDIA_ROOT.",
        )

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        password: str = options["password"]
        skip_resumes: bool = options["skip_resumes"]

        if options["clear"]:
            self._clear_seeded_data()

        admin_user = self._upsert_user(
            username="admin_aidar",
            email="admin@employment.demo.local",
            first_name="Айдарбек",
            last_name="Абдыракманов",
            role=User.Roles.ADMIN,
            password=password,
            is_staff=True,
            is_superuser=True,
        )

        groups_by_name: dict[str, AcademicGroup] = {}
        for group_data in GROUPS:
            group, _ = AcademicGroup.objects.update_or_create(
                name=group_data["name"],
                defaults={key: value for key, value in group_data.items() if key != "name"},
            )
            groups_by_name[group.name] = group

        employers_by_username: dict[str, Employer] = {}
        for employer_data in EMPLOYERS:
            user = self._upsert_user(
                username=employer_data["username"],
                email=employer_data["email"],
                first_name=employer_data["first_name"],
                last_name=employer_data["last_name"],
                role=User.Roles.EMPLOYER,
                password=password,
            )
            employer, _ = Employer.objects.update_or_create(
                user=user,
                defaults={
                    "company_name": employer_data["company_name"],
                    "address": employer_data["address"],
                    "phone": employer_data["phone"],
                    "description": employer_data["description"],
                },
            )
            employers_by_username[employer_data["username"]] = employer

        partners_count = 0
        for partner_data in PARTNERS:
            employer = employers_by_username.get(partner_data["employer_username"])
            Partner.objects.update_or_create(
                slug=partner_data["slug"],
                defaults={
                    "name": partner_data["name"],
                    "description": partner_data["description"],
                    "website": partner_data["website"],
                    "employer": employer,
                    "order": partner_data["order"],
                    "is_active": True,
                },
            )
            partners_count += 1

        alumni_profiles: list[AlumniProfile] = []
        for alumni_data in ALUMNI:
            user = self._upsert_user(
                username=alumni_data["username"],
                email=alumni_data["email"],
                first_name=alumni_data["first_name"],
                last_name=alumni_data["last_name"],
                role=User.Roles.ALUMNI,
                password=password,
            )
            employer = None
            employer_username = alumni_data.get("employer_username")
            if employer_username:
                employer = employers_by_username[employer_username]

            academic_group = groups_by_name[self._group_name_for(alumni_data)]
            employment_status = self._employment_status_for(alumni_data)
            profile, _ = AlumniProfile.objects.update_or_create(
                user=user,
                defaults={
                    "academic_group": academic_group,
                    "graduation_year": alumni_data["graduation_year"],
                    "specialty": alumni_data["specialty"],
                    "direction": academic_group.direction_name,
                    "profile": academic_group.profile,
                    "study_form": academic_group.study_form,
                    "degree_level": academic_group.degree_level,
                    "is_surveyed": employment_status != AlumniProfile.EmploymentStatus.LOST_CONTACT,
                    "employment_status": employment_status,
                    "employer": employer,
                    "workplace": employer.company_name if employer else self._workplace_for(alumni_data, employment_status),
                    "position": alumni_data["position"],
                    "continuing_education_place": self._education_place_for(alumni_data, employment_status),
                    "useful_subjects": self._useful_subjects_for(alumni_data),
                    "self_study_topics": self._self_study_topics_for(alumni_data),
                },
            )
            if not skip_resumes:
                self._attach_resume(profile, alumni_data)
            alumni_profiles.append(profile)

        for vacancy_data in VACANCIES:
            employer = employers_by_username[vacancy_data["employer_username"]]
            Vacancy.objects.update_or_create(
                employer=employer,
                title=vacancy_data["title"],
                defaults={
                    "description": vacancy_data["description"],
                    "requirements": vacancy_data["requirements"],
                    "location": vacancy_data["location"],
                    "salary": Decimal(vacancy_data["salary"]),
                    "is_active": vacancy_data["is_active"],
                },
            )

        employed_count = sum(1 for profile in alumni_profiles if profile.is_employed)
        unemployed_count = len(alumni_profiles) - employed_count
        active_vacancies = sum(1 for item in VACANCIES if item["is_active"])

        self.stdout.write(self.style.SUCCESS("Demo seed completed successfully."))
        self.stdout.write(f"Admin: {admin_user.username} / {password}")
        self.stdout.write(f"Employers: {len(EMPLOYERS)}")
        self.stdout.write(f"Academic groups: {len(GROUPS)}")
        self.stdout.write(f"Partners: {partners_count}")
        self.stdout.write(
            f"Alumni: {len(alumni_profiles)} "
            f"({employed_count} employed, {unemployed_count} looking for work)"
        )
        self.stdout.write(f"Vacancies: {len(VACANCIES)} ({active_vacancies} active)")
        self.stdout.write("All demo users use the same password unless --password is provided.")

    def _upsert_user(
        self,
        *,
        username: str,
        email: str,
        first_name: str,
        last_name: str,
        role: str,
        password: str,
        is_staff: bool = False,
        is_superuser: bool = False,
    ) -> User:
        defaults = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
            "is_active": True,
        }
        user, created = User.objects.get_or_create(username=username, defaults=defaults)
        for field_name, value in defaults.items():
            setattr(user, field_name, value)
        user.set_password(password)
        user.save()
        self._delete_incompatible_profiles(user=user, expected_role=role)

        if created:
            self.stdout.write(f"Created user: {username}")
        return user

    def _delete_incompatible_profiles(self, *, user: User, expected_role: str) -> None:
        if expected_role != User.Roles.ALUMNI:
            AlumniProfile.objects.filter(user=user).delete()

        if expected_role != User.Roles.EMPLOYER:
            with self._disabled_employer_delete_signal():
                Employer.objects.filter(user=user).delete()

    @contextmanager
    def _disabled_employer_delete_signal(self) -> Iterator[None]:
        post_delete.disconnect(delete_employer_user, sender=Employer)
        try:
            yield
        finally:
            post_delete.connect(delete_employer_user, sender=Employer)

    def _group_name_for(self, alumni_data: dict[str, Any]) -> str:
        year = alumni_data["graduation_year"]
        specialty = alumni_data["specialty"].lower()
        if year >= 2026 and "программ" in specialty:
            return "ИСТ-1-21"
        if year >= 2026 and ("безопас" in specialty or "сетев" in specialty):
            return "ПЗИдот-1-21"
        if year >= 2026:
            return "ИСТТ-1-21"
        if year == 2025:
            return "ИСТТдот-1-20"
        if year == 2024:
            return "ИСТд-1-20"
        return "ИСТТ-1-20"

    def _employment_status_for(self, alumni_data: dict[str, Any]) -> str:
        username = alumni_data["username"]
        if username in {"alumni_elnura_mamatova", "alumni_cholpon_kalykova"}:
            return AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION
        if username in {"alumni_kanykei_omurbekova", "alumni_dinara_sarieva", "alumni_ulan_asan_uulu"}:
            return AlumniProfile.EmploymentStatus.UNEMPLOYED
        if username in {"alumni_bakyt_toktogulov", "alumni_saltanat_tursunbaeva"}:
            return AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY
        if username in {"alumni_jomart_myrzabekov"}:
            return AlumniProfile.EmploymentStatus.SELF_EMPLOYED
        if alumni_data["is_employed"]:
            return AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY
        return AlumniProfile.EmploymentStatus.UNEMPLOYED

    def _workplace_for(self, alumni_data: dict[str, Any], employment_status: str) -> str:
        if employment_status == AlumniProfile.EmploymentStatus.SELF_EMPLOYED:
            return "ИП / проектная занятость"
        if employment_status == AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY:
            return "Частная организация"
        return ""

    def _education_place_for(self, alumni_data: dict[str, Any], employment_status: str) -> str:
        if employment_status != AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION:
            return ""
        if alumni_data["graduation_year"] >= 2025:
            return "Магистратура КГТУ им. И. Раззакова"
        return "Курсы повышения квалификации по аналитике данных"

    def _useful_subjects_for(self, alumni_data: dict[str, Any]) -> str:
        specialty = alumni_data["specialty"].lower()
        if "телеком" in specialty or "сетев" in specialty:
            return "OSI/TCP/IP, построение LAN, сетевые протоколы, Linux, информационная безопасность"
        if "аналит" in specialty:
            return "SQL, базы данных, анализ требований, визуализация данных, проектирование отчетов"
        if "кибер" in specialty or "безопас" in specialty:
            return "Криптография, защита информации, операционные системы, сетевые журналы"
        return "ООП, базы данных, UML-диаграммы, составление технического задания, web-разработка"

    def _self_study_topics_for(self, alumni_data: dict[str, Any]) -> str:
        skills = alumni_data.get("skills") or ""
        topics = []
        if "React" in skills or "JavaScript" in skills:
            topics.append("React, JavaScript")
        if "Docker" in skills or "DevOps" in skills:
            topics.append("Docker, CI/CD")
        if "Python" in skills:
            topics.append("Python")
        if "Power BI" in skills:
            topics.append("Power BI")
        return ", ".join(topics) or "Не приходилось"

    def _attach_resume(self, profile: AlumniProfile, alumni_data: dict[str, Any]) -> None:
        resume_path = f"resumes/{profile.user.username}/seed_resume.txt"
        if default_storage.exists(resume_path):
            default_storage.delete(resume_path)

        employment_status = profile.get_employment_status_display()
        employer_name = profile.employer.company_name if profile.employer else (profile.workplace or "—")
        content = (
            f"Резюме выпускника: {profile.user.last_name} {profile.user.first_name}\n"
            f"Email: {profile.user.email}\n"
            f"Группа: {profile.academic_group.name if profile.academic_group else '—'}\n"
            f"Год выпуска: {alumni_data['graduation_year']}\n"
            f"Специальность: {alumni_data['specialty']}\n"
            f"Форма обучения: {profile.get_study_form_display() if profile.study_form else '—'}\n"
            f"Статус: {employment_status}\n"
            f"Компания: {employer_name}\n"
            f"Позиция / желаемая позиция: {alumni_data['position']}\n"
            f"Продолжил обучение: {profile.continuing_education_place or '—'}\n"
            f"Полезно в работе: {profile.useful_subjects or '—'}\n"
            f"Изучал самостоятельно: {profile.self_study_topics or '—'}\n"
            f"Навыки: {alumni_data['skills']}\n"
            "Описание: демонстрационное резюме для проверки раздела профиля выпускника.\n"
        )
        profile.resume = default_storage.save(resume_path, ContentFile(content.encode("utf-8")))
        profile.save(update_fields=["resume"])

    def _clear_seeded_data(self) -> None:
        usernames = self._seed_usernames()
        for username in usernames:
            default_storage.delete(f"resumes/{username}/seed_resume.txt")
        Vacancy.objects.filter(employer__user__username__in=usernames).delete()
        Partner.objects.filter(slug__in={item["slug"] for item in PARTNERS}).delete()
        deleted_count, _ = User.objects.filter(username__in=usernames).delete()
        AcademicGroup.objects.filter(name__in={item["name"] for item in GROUPS}).delete()
        self.stdout.write(self.style.WARNING(f"Cleared seeded objects: {deleted_count}"))

    @staticmethod
    def _seed_usernames() -> set[str]:
        return (
            {"admin_aidar"}
            | {item["username"] for item in EMPLOYERS}
            | {item["username"] for item in ALUMNI}
        )
