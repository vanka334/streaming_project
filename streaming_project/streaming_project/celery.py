from celery import Celery
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "streaming_project.settings")

app = Celery("streaming_project")
app.config_from_object("django.conf:settings", namespace="CELERY")

# ⬇️ Добавь это, если вдруг не подтягивается из settings.py
app.conf.broker_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

app.autodiscover_tasks()
