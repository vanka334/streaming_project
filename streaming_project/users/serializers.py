from rest_framework import serializers
from django.contrib.auth import get_user_model

from users.models import Department, Project

User = get_user_model()
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = '__all__'

    def validate_email(self, value):
        # value — это строка, поэтому можно вызывать strip()
        value = value.strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже зарегистрирован.")
        return value
class DepartmentSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    class Meta:
        model = Department
        fields = ['id', 'name', 'users']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ['id', 'email','avatar', 'bio', 'name','surname', 'patronymic']
class ProjectSerializer(serializers.ModelSerializer):
    users_detail = UserSerializer(source='users', many=True, read_only=True)
    # Передача id пользователей при POST/PUT
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, write_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'users', 'users_detail']