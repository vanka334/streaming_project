from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth import get_user_model
from .models import VideoCall
from streaming_project.livekit_utils import generate_token

from notifications.task import send_event_notification

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_video_call(request):
    user = request.user
    participant_ids = request.data.get("participants", [])
    title = request.data.get("title", "").strip()

    if not participant_ids:
        return Response({"error": "Укажите участников"}, status=400)
    if not title:
        return Response({"error": "Укажите тему звонка"}, status=400)

    participants = User.objects.filter(id__in=participant_ids)

    call = VideoCall.objects.create(created_by=user, title=title)
    call.participants.set(participants | User.objects.filter(id=user.id))
    call_url = request.build_absolute_uri(f"/videocall/{call.id}")
    participant_names = ', '.join(
        f"{p.first_name} {p.surname}" for p in participants
    )
    print(participant_names);

    for participant in participants:
        if participant:
            send_event_notification.delay(
                event_code='1',
                sender_id=user.id,
                receiver_id=participant.id,
                context={"title": title, "participants": participant_names, 'link': call_url}
            )
    return Response({
        "call_id": call.id,
        "room": call.get_room_name(),
        "title": call.title,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_token(request):
    user = request.user
    call_id = request.query_params.get("call")

    try:
        call = VideoCall.objects.get(id=call_id)
    except VideoCall.DoesNotExist:
        return Response({"error": "Звонок не найден"}, status=404)

    if user not in call.participants.all():
        return Response({"error": "Вы не участник этого звонка"}, status=403)

    token = generate_token(identity=str(user.id),name= f"{user.name} {user.surname} {user.patronymic}",  room=call.get_room_name())
    return Response({
        "token": token,
        "room": call.get_room_name(),
        "title": call.title,
        "user":f"{user.name} {user.surname} {user.patronymic}"
    })
