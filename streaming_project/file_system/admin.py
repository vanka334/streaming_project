from django.contrib import admin


from file_system.models import File, Folder

# Register your models here.
admin.site.register(Folder)
admin.site.register(File)