from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

from users.models import Project

User = get_user_model()

class Status(models.Model):
    name = models.CharField(max_length=10, verbose_name="Имя")
    isDefault = models.BooleanField(default=False, verbose_name="Базовый?")
    isFinal = models.BooleanField(default=False, verbose_name="Последний этап?")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
# Create your models here.
    class Meta:
        verbose_name = "Статус"
        verbose_name_plural = "Статусы"
    def __str__(self):
        return self.name
def get_default_status():
    status = Status.objects.get(isDefault=True)
    return status

class Task(models.Model):
    name = models.CharField(max_length=20, verbose_name="Имя")
    description = models.TextField(verbose_name="Описание")
    status = models.ForeignKey(Status, on_delete= models.CASCADE, default= get_default_status,verbose_name="Статус")
    setter = models.ForeignKey(User, on_delete= models.CASCADE, related_name='settered_tasks', verbose_name="Постановщик")
    executor = models.ForeignKey(User,on_delete=models.SET_NULL, null=True, blank=True, related_name='executed_tasks', verbose_name="Исполнитель")
    project = models.ForeignKey(Project, related_name='tasks',null=True, blank=True, on_delete=models.CASCADE, verbose_name="Проект")
    deadline = models.DateTimeField(verbose_name="Срок сдачи",null=True, blank=True)
    date_commit = models.DateTimeField(verbose_name="Дата принятия", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    is_overdue = models.BooleanField(default=False, verbose_name="Просрочена?", db_index=True)
    isDone = models.BooleanField(default=False, verbose_name="Выполнено?")
    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
    def __str__(self): return self.name

@receiver(post_save, sender=Task)
def set_default_executor(sender, instance, **kwargs):
    # Если executor не указан или был удален, устанавливаем setter как executor
    if not instance.executor:
        instance.executor = instance.setter

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments', verbose_name="Задача")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments', verbose_name="Автор")
    text = models.TextField(verbose_name="Текст комментария")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Создан")
    def __str__(self):
        return f'Комментарий от {self.author} в {self.task.name}'

    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"
        ordering = ['-created_at']
