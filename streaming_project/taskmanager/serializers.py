from django.contrib.auth import get_user_model
from rest_framework import serializers

from taskmanager.models import Task, Status, Comment

from users.serializers import UserSerializer

from users.models import Project

User = get_user_model()
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
class TaskSerializer(serializers.ModelSerializer):
    # Для записи (PATCH/POST) — принимаем только ID
    status = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), write_only=True)
    setter = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    executor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        write_only=True
    )
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    # Для чтения (GET) — возвращаем полные объекты
    status_detail = StatusSerializer(source='status', read_only=True)
    setter_detail = UserSerializer(source='setter', read_only=True)
    executor_detail = UserSerializer(source='executor', read_only=True)

    def to_internal_value(self, data):
        # Преобразуем входящие данные (например, status_detail → status)
        if 'status_detail' in data:
            data['status'] = data.pop('status_detail')
        if 'setter_detail' in data:
            data['setter'] = data.pop('setter_detail')
        if 'executor_detail' in data:
            data['executor'] = data.pop('executor_detail')
        return super().to_internal_value(data)
    class Meta:
        model = Task
        fields = [
            'id', 'name', 'description','isDone','deadline', 'date_commit','created_at','project','is_overdue','isDone',
            'status', 'setter', 'executor',  # Для записи (только ID)
            'status_detail', 'setter_detail', 'executor_detail'  # Для чтения (полные данные)
        ]