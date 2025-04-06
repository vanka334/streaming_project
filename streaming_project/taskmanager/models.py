from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
User = get_user_model()

class Status(models.Model):
    name = models.CharField(max_length=10)
    isDefault = models.BooleanField(default=False)
# Create your models here.
def get_default_status():
    status = Status.objects.get(isDefault=True)
    return status

class Task(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField()
    status = models.ForeignKey(Status, on_delete= models.CASCADE, default= get_default_status)
    setter = models.ForeignKey(User, on_delete= models.CASCADE, related_name='settered_tasks')
    executor = models.ForeignKey(User,on_delete=models.SET_NULL, null=True, blank=True, related_name='executed_tasks')


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
        return f'Comment by {self.author} on {self.task.name}'

    class Meta:
        ordering = ['-created_at']