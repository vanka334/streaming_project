from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from .models import Status, Task, Comment
from notifications.task import send_event_notification

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
        return sorted(
            Status.objects.all(),
            key=lambda s: (
                0 if s.isDefault else (2 if s.isFinal else 1),
                s.order
            )
        )

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
    @staticmethod
    def get_default_status():
        return Status.objects.filter(isDefault=True).first()

class TaskService:
    @staticmethod
    def create_task(name, description,project, setter, deadline, executor=None, status=None):
        if status is None:
            status = Status.objects.get(isDefault=True)
        send_event_notification.delay(
            event_code='create_task',
            sender_id=setter.id,
            receiver_id=executor.id if executor is not None else setter.id,
            context={"name": name, "description": description, 'project': project.name, 'deadline':deadline}
        )
        return Task.objects.create(
            name=name,
            description=description,
            setter=setter,
            deadline=deadline,
            executor=executor,
            status=status,
            project=project
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
    def update_task(task_id, name=None, description=None, status=None,setter=None, executor=None, deadline=None):
        task = TaskService.get_task_by_id(task_id)
        if task:
            if name is not None:
                task.name = name
            if setter is not None:
                task.setter = setter
            if description is not None:
                task.description = description
            if status is not None:
                task.isDone = False
                task.status = status

            if executor is not None:
                task.executor = executor
            if deadline is not None:
                task.deadline = deadline
            task.save()
        return task

    @staticmethod
    def delete_task(task_id):
        task = TaskService.get_task_by_id(task_id)
        if task:
            task.delete()
        return task
    @staticmethod
    def commit_task( task_id):
        task = TaskService.get_task_by_id(task_id)
        task.isDone = True
        send_event_notification.delay(
            event_code='commit_task',
            sender_id=task.setter.id,
            receiver_id=task.executor.id if task.executor is not None else task.setter.id,
            context={"name": task.name, "description": task.description, 'project': task.project.name}
        )
        task.save()
    @staticmethod
    def reject_task(task_id):
        task = TaskService.get_task_by_id(task_id)
        default_status = StatusService.get_default_status()
        task.status = default_status
        send_event_notification.delay(
            event_code='reject_task',
            sender_id=task.setter.id,
            receiver_id=task.executor.id if task.executor is not None else task.setter.id,
            context={"name": task.name, "description": task.description, 'project': task.project.name}
        )
        task.save()
class CommentService:
    @staticmethod
    def create_comment(task, author, text):
        reciever = task.setter.id if author.id == task.executor.id else task.executor.id
        send_event_notification.delay(
            event_code='new_comment',
            sender_id=author.id,
            receiver_id=reciever,
            context={"author": author.name, "text": text, "task_name": task.name, "project": task.project.name}

        )
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