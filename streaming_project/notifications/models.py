from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()
# Create your models here.
class Event(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Код события (создание_задачи)")
    title = models.CharField(max_length=100, verbose_name='Заголовок письма')
    template = models.TextField(verbose_name='Шаблон письма')
    description = models.TextField(blank=True, verbose_name="Описание/подсказка для админки")
    class Meta:
        verbose_name = 'Почтовое событие'
        verbose_name_plural = 'Почтовые события'


class Notification(models.Model):
    event_name = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='notifications', verbose_name="Почтовый шаблон")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender', verbose_name="Отправитель")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver', verbose_name="Получатель")
    message = models.TextField(verbose_name="Содержание")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время отправки")
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'

