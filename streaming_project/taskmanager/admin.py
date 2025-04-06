from django.contrib import admin


from taskmanager.models import Task, Status, Comment

# Register your models here.
admin.site.register(Task)
admin.site.register(Status)
admin.site.register(Comment)
