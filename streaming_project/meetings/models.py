from django.db import models
from django.contrib.auth import get_user_model

from users.models import Department


# Create your models here.
class Meet(models.Model):
    title = models.CharField(max_length=20)
    description = models.TextField()
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='owner', verbose_name='Инициатор', blank=False, null=False)
    group = models.ForeignKey(Department, on_delete=models.CASCADE,  verbose_name='Группа', blank=True, null=True, related_name='streams')
