from livekit import api
import os

def generate_token(identity: str,name:str, room: str) -> str:
    token = api.AccessToken() \
        .with_identity(identity) \
        .with_name(name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
        )) \
        .to_jwt()
    return token
