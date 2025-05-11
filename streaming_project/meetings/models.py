from django.db import models
from django.contrib.auth import get_user_model




User = get_user_model()


# Create your models here.
class VideoCall(models.Model):
    title = models.CharField(max_length=50, default='Без темы', verbose_name='Тема')
    participants = models.ManyToManyField(User, related_name='participants', verbose_name='Участники')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Создано(кем):')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано(когда):')
    class Meta:
        verbose_name = 'Видеозвонок'
        verbose_name_plural = 'Видеозвонки'

    def get_room_name(self):
        return f"videocall_{self.id}"