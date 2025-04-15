from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.
from django.contrib.auth.models import Group
from django.db.models.signals import pre_save
from django.dispatch import receiver



class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Почта')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Аватар')
    bio = models.TextField(blank=True, null=True, verbose_name='О себе')
    name = models.CharField(max_length=10, null=True, verbose_name='Имя')
    surname = models.CharField(max_length=10, null=True, verbose_name="Фамилия")
    patronymic = models.CharField(max_length=10, blank=True, null=True, verbose_name='Отчество')
    REQUIRED_FIELDS = ['password','email']
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
    def __str__(self):
        return self.username+' '+ self.email
class Department(models.Model):
    name = models.CharField(max_length=15, unique=True, verbose_name='Название')
    users = models.ManyToManyField(User, related_name='departments', verbose_name='Пользователи')
    folder = models.CharField(max_length=30, unique=True, verbose_name='Базовая папка')
    isManagement = models.BooleanField(default=False, verbose_name='Папка руководства')
    class Meta:
        verbose_name = 'Отдел'
        verbose_name_plural = 'Отделы'
    def __str__(self):
        return self.name
class Project(models.Model):
    name = models.CharField(max_length=30, unique=True, verbose_name='Название')
    description = models.TextField(verbose_name="Описание")
    users = models.ManyToManyField(User,  blank=True,  related_name='users', verbose_name='Пользователи')
    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
    def __str__(self):
        return self.name