import logging
import logging.handlers
from pathlib import Path
from os import environ, path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ.get('T_ENCRYPTION_PASSKEY_1')
REFRESH_TOKEN_SECRET = environ.get('T_ENCRYPTION_PASSKEY_4')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = environ.get('T_DEBUG', False)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    environ.get('T_SERVER_NAME'),
    environ.get('T_SELF_NAME'),
    'game'
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    'localhost',
    '127.0.0.1',
    environ.get('T_SERVER_NAME'),
    environ.get('T_SELF_NAME'),
    'game'
]

# Application definition

INSTALLED_APPS = [
    'app',
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_prometheus',
    'rest_framework',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

ROOT_URLCONF = 'service.urlpatterns'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'service.asgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'db_' + environ.get('T_SELF_NAME'),
        'USER': environ.get('T_PGSQL_USERNAME'),
        'PASSWORD': environ.get('T_PGSQL_PASSWORD'),
        'HOST': 'db_' + environ.get('T_SELF_NAME'),
        'PORT': environ.get('T_PORT_INTERN_POSTGRE'),
    }
}

# Channels

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [
                ('redis://'
                 + environ.get('T_REDIS_USERNAME') + ':'
                 + environ.get('T_REDIS_PASSWORD')
                 + '@redis:'
                 + environ.get('T_PORT_INTERN_CACHING') + '/'
                 + environ.get('T_SELF_REDIS_ID'))
                ],
            "capacity": 3000,
            "expiry": 3600,
        },
    },
}

# RestAPI

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'UNAUTHENTICATED_USER': None,
}

# Logging

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'global': {
            'class': 'logging.handlers.SysLogHandler',
            'address': ('logstash', int(environ.get('T_PORT_INTERN_LOGGING_3'))),
            'formatter': 'log.global',
        },
    },
    'loggers': {
        'daphne': {
            'handlers': ['global'],
            'level': 'INFO',
            'propagate': False,
        }
    },
    'formatters': {
        'log.global': {
            'format': '%(asctime)s, backend: "' + environ.get('T_SELF_NAME') + '", level: "%(levelname)s", message: "%(message)s", file: "%(filename)s", function: "%(funcName)s", line: "%(lineno)s"',
            'datefmt': '%Y/%m/%d %H:%M:%S',
        }
    },
}

# Smtp

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = environ.get('T_SMTP_HOSTNAME')
EMAIL_USE_TLS = True
EMAIL_PORT = environ.get('T_SMTP_HOSTPORT')
EMAIL_HOST_USER = environ.get('T_SMTP_USERNAME')
EMAIL_HOST_PASSWORD = environ.get('T_SMTP_PASSWORD')
DEFAULT_FROM_EMAIL = environ.get('T_SMTP_USERNAME')

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/' + environ.get('T_SELF_NAME') + '/'
STATIC_ROOT = path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/' + environ.get('T_SELF_NAME') + '/'
MEDIA_ROOT = path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
