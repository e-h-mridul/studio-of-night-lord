# Studio of Night Lord

A personal portfolio website built to showcase my projects, technical skills, education, certifications, and professional profile. Designed with a dark visual identity, responsive layouts, and subtle animations.

**Live website:** https://studio-of-night-lord.onrender.com

## Features

- Responsive homepage with an interactive portrait carousel.
- Smooth scroll-reveal animations and horizontal project and certification galleries.
- Project cards with dedicated project detail pages.
- Django Admin for managing profile information, skills, projects, education, experience, certifications, and social links.
- Certificate images and PDF documents.
- Résumé preview in the browser.
- Contact form with messages stored in the database.
- Cloud-based media storage for production uploads.

## Technology Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend**
- Python
- Django 5.2

**Database**
- MariaDB for local development
- PostgreSQL for production

**Media and Deployment**
- Cloudinary for production media storage
- Render for application hosting
- Git and GitHub for version control

## Project Structure

```text
midnight-studio/
├── config/
│   ├── settings.py
│   ├── settings_production.py
│   ├── urls.py
│   └── wsgi.py
├── portfolio/
│   ├── migrations/
│   ├── static/
│   │   └── portfolio/
│   │       ├── css/
│   │       └── js/
│   ├── templates/
│   │   └── portfolio/
│   ├── models.py
│   ├── storage.py
│   ├── views.py
│   └── urls.py
├── manage.py
├── requirements.txt
└── requirements-production.txt
```

## Local Development

### Prerequisites

- Python 3.12
- MariaDB or a compatible MySQL server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/e-h-mridul/studio-of-night-lord.git
cd studio-of-night-lord
```

### 2. Create and activate a virtual environment

On Windows using Git Bash:

```bash
python -m venv .venv
source .venv/Scripts/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create a local `.env` file in the project root. Configure the following variables with your own local values:

```dotenv
STUDIO_SECRET_KEY=replace-with-a-private-django-secret
STUDIO_DB_PASSWORD=your-local-database-password
```

Configure the local MariaDB database and database user according to `config/settings.py`.

**Never commit `.env` or real credentials to GitHub.**

### 5. Apply database migrations

```bash
python manage.py migrate
```

### 6. Start the development server

```bash
python manage.py runserver
```

Open http://127.0.0.1:8000/ in your browser.

## Production Deployment

The production configuration uses:

- Render for hosting the Django application.
- Neon PostgreSQL for the production database.
- Cloudinary for uploaded images and PDF documents.
- WhiteNoise for serving collected static files.

Production settings are maintained separately in `config/settings_production.py`.

Production environment variables include `DJANGO_SETTINGS_MODULE`, `STUDIO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Set these values securely through the hosting provider's environment-variable settings. Never place real production credentials in source code or documentation.

## Security and Data Protection

- Environment files and local databases are excluded from version control.
- Uploaded personal media and database backups are stored separately from source code.
- Production and local database configurations are maintained separately.
- Database migrations are used to manage schema changes.

## License

No license has been specified yet. All rights and permissions are reserved by default unless a license is added.
