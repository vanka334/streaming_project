from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from .models import Status, Task, Comment

class StatusService:
    @staticmethod
    def create_status(name, is_default=False):
        return Status.objects.create(name=name, isDefault=is_default)

    @staticmethod
    def get_status_by_id(status_id):
        try:
            return Status.objects.get(id=status_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def get_all_statuses():
        return Status.objects.all()

    @staticmethod
    def update_status(status_id, name=None, is_default=None):
        status = StatusService.get_status_by_id(status_id)
        if status:
            if name is not None:
                status.name = name
            if is_default is not None:
                status.isDefault = is_default
            status.save()
        return status

    @staticmethod
    def delete_status(status_id):
        status = StatusService.get_status_by_id(status_id)
        if status:
            status.delete()
        return status

class TaskService:
    @staticmethod
    def create_task(name, description, setter, executor=None, status=None):
        if status is None:
            status = Status.objects.get(isDefault=True)
        return Task.objects.create(
            name=name,
            description=description,
            setter=setter,
            executor=executor,
            status=status
        )

    @staticmethod
    def get_task_by_id(task_id):
        try:
            return Task.objects.get(id=task_id)
        except ObjectDoesNotExist:
            print(f"Task {pk} not found!")  # Логирование
            return None


    @staticmethod
    def get_all_tasks(user):
        departments = user.departments.all()
        if departments.count() > 1:
            # Определяем отделы
            managment_depts = departments.filter(isManagement=True)
            non_managment_depts = departments.filter(isManagement=False)

            # Все задачи отдела, где isManagment=False
            dept_tasks = Task.objects.filter(setter__departments__in=non_managment_depts)

            # Только задачи пользователя в управленческих отделах
            user_tasks = Task.objects.filter(
                Q(setter=user) | Q(executor=user),
                setter__departments__in=managment_depts
            )

            # Объединяем и убираем дубли
            tasks = (dept_tasks | user_tasks).distinct()
        else:
            # Если обычный сотрудник — возвращаем только его задачи
            tasks = Task.objects.filter(Q(setter=user) | Q(executor=user)).distinct()

        return tasks


    @staticmethod
    def update_task(task_id, name=None, description=None, status=None,setter=None, executor=None):
        task = TaskService.get_task_by_id(task_id)
        if task:
            if name is not None:
                task.name = name
            if setter is not None:
                task.setter = setter
            if description is not None:
                task.description = description
            if status is not None:
                task.status = status
            if executor is not None:
                task.executor = executor
            task.save()
        return task

    @staticmethod
    def delete_task(task_id):
        task = TaskService.get_task_by_id(task_id)
        if task:
            task.delete()
        return task

class CommentService:
    @staticmethod
    def create_comment(task, author, text):
        return Comment.objects.create(
            task=task,
            author=author,
            text=text
        )

    @staticmethod
    def get_comment_by_id(comment_id):
        try:
            return Comment.objects.get(id=comment_id)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_comments_by_task(task_id):
        task = TaskService.get_task_by_id(task_id)
        return Comment.objects.filter(task=task)
    @staticmethod
    def get_all_comments():
        return Comment.objects.all()

    @staticmethod
    def update_comment(comment_id, text=None):
        comment = CommentService.get_comment_by_id(comment_id)
        if comment:
            if text is not None:
                comment.text = text
            comment.save()
        return comment

    @staticmethod
    def delete_comment(comment_id):
        comment = CommentService.get_comment_by_id(comment_id)
        if comment:
            comment.delete()
        return comment