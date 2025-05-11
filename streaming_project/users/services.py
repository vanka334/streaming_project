from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import Department, Project
from notifications.task import send_event_notification
from .models import UserInvite

User = get_user_model()


class RegService:


    @staticmethod
    def register(username, email, password, name, surname, patronymic,token):

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "Пользователь с таким email уже зарегистрирован."})
        if User.objects.filter(username=username).exists():
            raise ValidationError({"username": "Пользователь с таким username уже зарегистрирован."})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            name=name,
            surname=surname,
            patronymic=patronymic
        )

        refresh = RefreshToken.for_user(user)

        if token:
            try:
                invite = UserInvite.objects.get(token=token, is_used=False)
                departments = invite.created_by.departments.filter(isManagement=False)
                print(departments)
                print("вроде вот")
                if departments.exists():
                    user.departments.add(departments.first())
                    print(departments.first())
                    print(user.departments)
                invite.is_used = True
                invite.save()
            except UserInvite.DoesNotExist:
                print('OSHIBKA NAXUI')  # Можно залогировать
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
    def get_user_by_id(user_id):
        try:
            user = User.objects.get(pk=user_id)

            return User.objects.get(pk=user_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def checkUser(user_id):
        return Department.objects.filter(
            users__id=user_id,
            isManagement=True
        ).exists()
    @staticmethod
    def get_user_by_email(self, email):
        return User.objects.get(email=email)
    @staticmethod
    def get_all_users():
        return User.objects.all()

    @staticmethod
    def update_user_profile(user, email=None, avatar=None, bio=None, name=None, surname=None, patronymic=None):

        if email is not None:
            user.email = email
        if avatar is not None:
            user.avatar = avatar
        if bio is not None:
            user.bio = bio
        if name is not None:
            user.name = name
        if surname is not None:
            user.surname = surname
        if patronymic is not None:
            user.patronymic = patronymic

        user.save()
        return user


class ProjectService:
    @staticmethod
    def get_all_projects():
        return Project.objects.prefetch_related('users').all()

    @staticmethod
    def get_project_by_id(project_id):
        try:
            project = Project.objects.prefetch_related('users', 'tasks__status').get(pk=project_id)

            tasks = project.tasks.all()
            total_tasks = tasks.count()
            print(total_tasks)
            completed_tasks = tasks.filter(isDone=True).count()
            print(completed_tasks)
            overdue_tasks = tasks.filter(is_overdue=True).count()
            print(overdue_tasks)

            status_distribution = (
                tasks.values('status__name')
                .annotate(count=Count('id'))
                .order_by()
            )

            statistics = {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "overdue_tasks": overdue_tasks,
                "kpi": round((completed_tasks / total_tasks) * 100, 2) if total_tasks else 0,
                "status_distribution": {
                    item["status__name"]: item["count"] for item in status_distribution
                }
            }

            return project, statistics

        except Project.DoesNotExist:
            return None, None

    @staticmethod
    def create_project(name, description, users):
        # Сначала создаём проект без поля many-to-many
        project = Project.objects.create(
            name=name,
            description=description,
        )
        # Затем устанавливаем связь для поля many-to-many
        project.users.set(users)
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



class PasswordResetService:

    @staticmethod
    def send_reset_email(email: str, domain: str, protocol: str = "https") -> None:
        user = User.objects.filter(email=email).first()
        if not user:
            return  # не палим существование пользователя

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        link = f"{protocol}://{domain}/reset-password?uid={uid}&token={token}"
        send_event_notification.delay(
            event_code='reset_password',
            sender_id=1,
            receiver_id=user.id,
            context={"reset_link": link}

        )


    @staticmethod
    def reset_password(uidb64: str, token: str, new_password: str) -> None:
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            raise ValidationError("Невалидная ссылка")

        if not default_token_generator.check_token(user, token):
            raise ValidationError("Ссылка недействительна или устарела")

        user.set_password(new_password)
        user.save()