import os
import subprocess

from django.apps import apps
from django.core.files.storage import FileSystemStorage
from django.db import connection
from django.views.generic import TemplateView
from unfold.views import UnfoldModelAdminViewMixin
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse
from django.views.generic import TemplateView
from io import StringIO
import csv

import datetime
class AllModelsView(TemplateView):
    title = "Выбор модели и формата"  # Заголовок страницы
    permission_required = ()  # Укажите права, если нужно
    template_name = "admin/import_export.html"  # Путь к вашему шаблону

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Добавляем request в контекст
        context['request'] = self.request

        # Получаем все модели из базы данных
        models = apps.get_models()
        context["model_options"] = [
            {"value": f"{model.__name__}", "label": model._meta.verbose_name}
            for model in models
        ]
        context["format_options"] = [
            {"value": "sql", "label": "SQL"},
            {"value": "csv", "label": "CSV"},
        ]
        return context




def import_data(request):
    if request.method == "POST" and request.FILES.get("file"):
        try:
            file = request.FILES["file"]
            path = f"/tmp/uploaded_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
            with open(path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            db_name = os.environ.get('POSTGRES_DB')
            db_user = os.environ.get('POSTGRES_USER')
            db_password = os.environ.get('POSTGRES_PASSWORD')
            db_host = os.environ.get('DB_HOST', 'localhost')
            db_port = os.environ.get('DB_PORT', '5432')

            command = [
                "psql",
                "-h", db_host,
                "-p", db_port,
                "-U", db_user,
                "-d", db_name,
                "-f", path
            ]

            env = os.environ.copy()
            env["PGPASSWORD"] = db_password

            subprocess.run(command, check=True, env=env)
            os.remove(path)
            return HttpResponse("Импорт успешно выполнен")

        except Exception as e:
            return HttpResponse(f"Ошибка импорта: {e}", status=500)

    return HttpResponse("Загрузите файл через POST", status=400)

def download_db_backup(request):
    try:
        db_name = os.environ.get('POSTGRES_NAME')
        db_user = os.environ.get('POSTGRES_USER')
        db_password = os.environ.get('POSTGRES_PASSWORD')
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = os.environ.get('DB_PORT', '5432')

        backup_filename = f"backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        backup_path = f"/tmp/{backup_filename}"

        command = [
            "pg_dump",
            "-h", db_host,
            "-p", db_port,
            "-U", db_user,
            "-d", db_name,
            "-f", backup_path
        ]

        env = os.environ.copy()
        env["PGPASSWORD"] = db_password

        subprocess.run(command, check=True, env=env)

        with open(backup_path, "rb") as f:
            data = f.read()

        os.remove(backup_path)

        response = HttpResponse(data, content_type="application/sql")
        response["Content-Disposition"] = f'attachment; filename="{backup_filename}"'
        return response

    except Exception as e:
        return HttpResponse(f"Ошибка экспорта: {e}", status=500)
