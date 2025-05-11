from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()
# Create your models here.
class Event(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Код события (создание_задачи)")
    title = models.CharField(max_length=100, verbose_name='Заголовок письма')
    template = models.TextField(verbose_name='Шаблон письма')
    description = models.TextField(blank=True, verbose_name="Описание/подсказка для админки")

class Notification(models.Model):
    event_name = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

