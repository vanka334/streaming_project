from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
User = get_user_model()

class Status(models.Model):
    name = models.CharField(max_length=10, verbose_name="Имя")
    isDefault = models.BooleanField(default=False, verbose_name="Базовый?")
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
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Комментарий от {self.author} в {self.task.name}'

    class Meta:
        ordering = ['-created_at']