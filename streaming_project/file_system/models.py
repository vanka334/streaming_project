import os

from django.apps import apps
# Create your models here.
from django.db import models

from django.contrib.auth import get_user_model
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from users.models import Department


class Folder(models.Model):
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=255)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subfolders')
    departments = models.ManyToManyField(Department, blank=True, related_name='folders')

    def __str__(self):
        return self.name

    @property
    def is_common(self):
        return not self.departments.exists()
@receiver(post_save, sender=Department)
def create_departement_folder(sender, instance, created, **kwargs):
    if created and not instance.folder:
        root_folder = Folder.objects.create(
            name=instance.name,
            department=instance,
            parent_folder=None
        )
        instance.folder = root_folder
        instance.save()
@receiver(post_save, sender=Folder)
def create_folder(sender, instance,created, **kwargs):
    if created :
        os.makedirs('\\uploads\\'+instance.path)




class File(models.Model):
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='uploads/')
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='files')
    def __str__(self):
        return self.name