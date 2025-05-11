from django.contrib import admin
from .models import Event, Notification

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('code', 'title')
    search_fields = ('code', 'title')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'sender', 'receiver', 'timestamp')
    list_filter = ('event_name',)
