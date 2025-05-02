from celery import shared_task
from django.utils import timezone
from .models import Task

@shared_task
def update_overdue_flags():
    now = timezone.now()
    # Сбросим флаг у тех, у кого задача теперь не просрочена
    Task.objects.filter(isDone=False, deadline__gte=now, is_overdue=True).update(is_overdue=False)

    # Установим флаг у просроченных задач
    Task.objects.filter(isDone=False, deadline__lt=now, is_overdue=False).update(is_overdue=True)
