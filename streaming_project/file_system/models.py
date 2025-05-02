import os

from django.apps import apps
# Create your models here.
from django.db import models

from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from users.models import Department


class Folder(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя папки")
    path = models.CharField(max_length=255, verbose_name="Путь")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subfolders', verbose_name="Родительская папка")
    departments = models.ManyToManyField(Department, blank=True, related_name='folders', verbose_name="Доступно для:")

    class Meta:
        verbose_name = "Папка"
        verbose_name_plural = "Папки"
    def __str__(self):
        return self.name

    @property
    def is_common(self):
        return not self.departments.exists()
@receiver(post_save, sender=Department)
def create_departement_folder(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.isManagement:
        # Корневая папка, без родителя
        folder_path = instance.name  # Пример: uploads/Руководство/
        parent_folder = None
    else:
        # Для неуправленческих — нужна родительская папка
        # Например, по логике: искать по isManagement=True (или задать вручную)
        parent_folder = Folder.objects.filter( parent=None).first()
        if not parent_folder:
            # Создаём корневую папку для всех остальных, если вдруг нет
            parent_folder = Folder.objects.create(
                name="Руководство",
                path="Руководство",
                parent=None
            )

        folder_path = os.path.join(parent_folder.path, instance.name)  # uploads/Руководство/Отдел продаж

    # Создаём папку в базе
    root_folder = Folder.objects.create(
        name=instance.name,
        parent=parent_folder,
        path=folder_path+"\\"
    )

    # Привязываем департамент к папке
    root_folder.departments.add(instance)
    instance.folder = root_folder.name
    instance.save()
@receiver(post_save, sender=Folder)
def create_folder(sender, instance, created, **kwargs):
    if not created:
        return

    base_dir = os.path.join(os.getcwd(), 'uploads')  # Папка uploads в корне проекта
    full_path = os.path.join(base_dir, instance.path)
    os.makedirs(full_path, exist_ok=True)

import os

def file_upload_path(instance, filename):
    # instance.folder.path может быть, например: 'Management/Folder/Subfolder'
    return os.path.join( instance.folder.path, filename)


class File(models.Model):
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files', verbose_name='Папка')
    file = models.FileField(upload_to=file_upload_path, verbose_name='Файл')
    name = models.CharField(max_length=255, verbose_name='Имя')
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, verbose_name='Владелец')
    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
    def __str__(self):
        return self.name
@receiver(post_delete, sender=File)
def delete_file_on_model_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            instance.file.delete(save=False)