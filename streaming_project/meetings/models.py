from django.db import models
from django.contrib.auth import get_user_model




User = get_user_model()


# Create your models here.
class VideoCall(models.Model):
    title = models.CharField(max_length=50, default='Без темы')
    participants = models.ManyToManyField(User, related_name='participants')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_room_name(self):
        return f"videocall_{self.id}"