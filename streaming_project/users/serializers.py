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
class UserCallSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = ['id', 'name','surname', 'patronymic', 'departments','avatar']
class ProjectSerializer(serializers.ModelSerializer):
    users_detail = UserSerializer(source='users', many=True, read_only=True)
    # Передача id пользователей при POST/PUT
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, write_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'users','avatar', 'users_detail']

from rest_framework import serializers
from .models import UserInvite
from .services import RegService


class UserInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=10)
    surname = serializers.CharField(max_length=10)
    patronymic = serializers.CharField(max_length=10, required=False, allow_blank=True)
    token = serializers.UUIDField(read_only=True)

    def validate_email(self, value):
        if UserInvite.objects.filter(email=value, is_used=False).exists():
            raise serializers.ValidationError("Для этой почты уже создано приглашение.")
        return value
    def create(self, validated_data):
        return UserInvite.objects.create(
            email=validated_data['email'],
            name=validated_data['name'],
            surname=validated_data['surname'],
            patronymic=validated_data.get('patronymic', ''),
            created_by=self.context['request'].user
        )

    def to_representation(self, instance):
        return {
            "email": instance.email,
            "name": instance.name,
            "surname": instance.surname,
            "patronymic": instance.patronymic,
            "token": str(instance.token),  # обязательно str()
        }

class UserInviteRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInvite
        fields = ['email', 'name', 'surname', 'patronymic']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(max_length=10)
    surname = serializers.CharField(max_length=10)
    patronymic = serializers.CharField(max_length=10, required=False, allow_blank=True)
    token = serializers.UUIDField(required=False)

