from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.
from django.contrib.auth.models import Group
from django.db.models.signals import pre_save
from django.dispatch import receiver



class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Почта')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=10, null=True)
    surname = models.CharField(max_length=10, null=True)
    patronymic = models.CharField(max_length=10, blank=True, null=True)
    REQUIRED_FIELDS = ['password','email']
class Department(models.Model):
    name = models.CharField(max_length=15, unique=True)
    users = models.ManyToManyField(User, related_name='departments')
    folder = models.CharField(max_length=30, unique=True)
    isManagement = models.BooleanField(default=False)

class Project(models.Model):
    name = models.CharField(max_length=30)
    description = models.TextField()
    departament = models.ManyToManyField(Department,  blank=True,  related_name='departments')
