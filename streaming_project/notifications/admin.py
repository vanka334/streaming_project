from django.contrib import admin

from notifications.models import Notification, Event

# Register your models here.
admin.site.register(Notification)
admin.site.register(Event)