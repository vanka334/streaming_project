from django.contrib import admin
from .models import VideoCall

@admin.register(VideoCall)
class VideoCallAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    filter_horizontal = ('participants',)