from django.contrib import admin




from django.contrib import admin
from .models import Task, Status, Comment

@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'isDefault', 'isFinal', 'order')
    list_editable = ('isDefault', 'isFinal', 'order')
    ordering = ('order',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'setter', 'executor', 'deadline', 'isDone', 'is_overdue')
    list_filter = ('status', 'isDone', 'is_overdue', 'project')
    search_fields = ('name', 'description')
    autocomplete_fields = ('setter', 'executor', 'project')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    search_fields = ('text',)
    autocomplete_fields = ('task', 'author')
