from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import Department, Project

User = get_user_model()


class RegService:

    @staticmethod
    def register(username, email, password):
        # Проверяем, что пользователь с таким email или username не существует
        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": f"Пользователь с таким email уже зарегистрирован. вот: {User.objects.filter(email=email)}"})
        if User.objects.filter(username=username).exists():
            raise ValidationError({"username": "Пользователь с таким username уже зарегистрирован."})

        # Создаем пользователя
        user =User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Генерируем токены
        refresh = RefreshToken.for_user(user)
        return {
            "user": user.email,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }
class DepartmentService:
    @staticmethod
    def get_all_departments():
        return Department.objects.all()

    @staticmethod
    def get_department_by_id(department_id):
        try:
            return Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return None

    @staticmethod
    def create_department(name, user_ids):
        department = Department.objects.create(name=name)
        if user_ids:
            users = User.objects.filter(id__in=user_ids)
            department.users.set(users)
        return department

    @staticmethod
    def update_department(department_id, name=None, user_ids=None):
        department = DepartmentService.get_department_by_id(department_id)
        if department:
            if name is not None:
                department.name = name
            if user_ids is not None:
                users = User.objects.filter(id__in=user_ids)
                department.users.set(users)
            department.save()
        return department

    @staticmethod
    def delete_department(department_id):
        department = DepartmentService.get_department_by_id(department_id)
        if department:
            department.delete()
        return department



class UserService:
    @staticmethod
    def get_user_by_id(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_user_by_email(self, email):
        return User.objects.get(email=email)
    @staticmethod
    def get_all_users():
        return User.objects.all()



class ProjectService:
    @staticmethod
    def get_all_projects():
        return Project.objects.prefetch_related('departament').all()

    @staticmethod
    def get_project_by_id(project_id):
        try:
            return Project.objects.prefetch_related('departament').get(pk=project_id)
        except Project.DoesNotExist:
            return None

    @staticmethod
    def create_project(name, description, departament_ids=None):
        project = Project.objects.create(
            name=name,
            description=description
        )
        if departament_ids:
            departments = Department.objects.filter(id__in=departament_ids)
            project.departament.set(departments)
        return project

    @staticmethod
    def update_project(project_id, name=None, description=None, departament_ids=None):
        project = ProjectService.get_project_by_id(project_id)
        if not project:
            return None

        if name is not None:
            project.name = name
        if description is not None:
            project.description = description

        if departament_ids is not None:
            departments = Department.objects.filter(id__in=departament_ids)
            project.departament.set(departments)

        project.save()
        return project

    @staticmethod
    def delete_project(project_id):
        project = ProjectService.get_project_by_id(project_id)
        if project:
            project.delete()
            return True
        return False


