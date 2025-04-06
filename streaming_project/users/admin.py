from django.contrib import admin
from django.contrib.auth import get_user_model

from users.models import Department, Project

User = get_user_model()
# Register your models here.
admin.site.register(User)
admin.site.register(Department)
admin.site.register(Project)