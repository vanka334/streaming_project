from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from notifications.services import render_template
from streaming_project import settings
from .models import Event, Notification
User = get_user_model()
@shared_task
def send_event_notification(event_code: str, sender_id: int, receiver_id: int, context: dict):


    event = Event.objects.get(code=event_code)
    sender = User.objects.get(id=sender_id)
    receiver = User.objects.get(id=receiver_id)
    print("START render_template")
    print(event)
    message = render_template(event.template, context)
    try:
        rendered = render_template(event.template, context)
        print("SHABLON:", repr(event.template))
        print("CONTEXT:", context)
        print("RENDERED:", repr(rendered))
    except Exception as e:
        print("⚠️ Ошибка при рендере:", str(e))

    print("SHABLON:", repr(event.template))
    print("CONTEXT:", context)
    print("RENDERED:", repr(rendered))
    send_mail(
        subject=event.title,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[receiver.email],
        fail_silently=False,
    )

    Notification.objects.create(
        event_name=event,
        sender=sender,
        receiver=receiver,
        message=message,
    )
