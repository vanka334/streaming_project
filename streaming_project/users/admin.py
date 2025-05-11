from django.contrib import admin
from django.contrib.auth import get_user_model






# Register your models here.
from django.contrib import admin
from .models import User, Department, Project, UserInvite
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'name', 'surname', 'is_staff')
    search_fields = ('username', 'email', 'name', 'surname')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительно', {
            'fields': ('avatar', 'bio', 'name', 'surname', 'patronymic', 'departments'),
        }),
    )

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'folder', 'isManagement')
    filter_horizontal = ('users',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    filter_horizontal = ('users',)

@admin.register(UserInvite)
class UserInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'token', 'created_by', 'is_used', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('email',)
