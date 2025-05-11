from django.contrib import admin
from .models import Folder, File

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'path', 'parent')
    search_fields = ('name', 'path')
    list_filter = ('departments',)

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'folder', 'owner')
    search_fields = ('name',)
    autocomplete_fields = ('folder', 'owner')
