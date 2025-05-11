import { useEffect, useState } from 'react';
import {
  Room,
  Participant,
  LocalParticipant,
  RoomEvent,
  Track,
  RemoteTrackPublication,
  TrackPublication,
  RemoteParticipant,
  LocalTrackPublication
} from 'livekit-client';
import api from "../../../../api/interceptors.ts";
import { ParticipantView } from "./ParticipiantView/ParticipiantView.tsx";
import "./VideoRoom.css";

export function VideoRoom({ callId }: { callId: number }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speakingSids, setSpeakingSids] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState<string>("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  useEffect(() => {
    const joinRoom = async () => {
      try {
        const res = await api.get(`/video/token/?call=${callId}`);
        const token = res.data.token;
        setTitle(res.data.title || "");

        const room = new Room();
        await room.connect('wss://livekit.intercolormpt.ru', token, {
          autoSubscribe: true,
        });

        try {
          await room.localParticipant.enableCameraAndMicrophone();
        } catch (err) {
          console.warn('Медиа недоступны:', err);
          setMicEnabled(false);
          setCamEnabled(false);
        }

        room.on(RoomEvent.TrackSubscribed, (track: Track) => {
          if (track.kind === 'audio') {
            const el = track.attach();
            el.setAttribute('data-livekit-audio', 'true');
            el.style.display = 'none';
            document.body.appendChild(el);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: Track) => {
          if (track.kind === 'audio') {
            track.detach().forEach(el => el.remove());
          }
        });

        setRoom(room);
        setParticipants([
          room.localParticipant,
          ...Array.from(room.remoteParticipants.values()),
        ]);

        room.on(RoomEvent.ParticipantConnected, (p) => {
          setParticipants(prev => [...prev, p]);
        });

        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          setParticipants(prev => prev.filter(q => q !== p));
        });

        room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
          const sids = new Set(speakers.map((p) => p.sid));
          setSpeakingSids(sids);
        });

      } catch (err) {
        console.error('Ошибка при подключении к комнате:', err);
      }
    };

    joinRoom();

    return () => {
      room?.disconnect();
      document.querySelectorAll('[data-livekit-audio]').forEach(el => el.remove());
    };
  }, [callId]);
  const getGridClass = (count: number) => {
    if (count === 1) return 'video-grid one';
    if (count === 2) return 'video-grid two';
    if (count === 3) return 'video-grid three';
    if (count === 4) return 'video-grid four';
    return 'video-grid many';
  };
  const toggleMic = () => {
    const local = room?.localParticipant;
    if (!local) return;

    const newState = !micEnabled;
    local.setMicrophoneEnabled(newState);
    setMicEnabled(newState);
  };

  const toggleCam = () => {
    const local = room?.localParticipant;
    if (!local) return;

    const newState = !camEnabled;
    local.setCameraEnabled(newState);
    setCamEnabled(newState);
  };

  const toggleScreenShare = async () => {
    const local = room?.localParticipant;
    if (!local) return;

    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const [track] = stream.getVideoTracks();
        await local.publishTrack(track);
        setScreenSharing(true);
      } catch (err) {
        console.warn("Ошибка при выборе экрана:", err);
      }
    } else {
      const screenPub = Array.from(local.videoTrackPublications.values()).find(
        (pub: TrackPublication) => pub.source === 'screen_share'
      );
      if (screenPub && screenPub.track) {
        local.unpublishTrack(screenPub.track);
        screenPub.track.stop();
      }
      setScreenSharing(false);
    }
  };

  const leaveRoom = () => {
    room?.disconnect();
    document.querySelectorAll('[data-livekit-audio]').forEach(el => el.remove());
    window.location.href = '/tasks';
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/videocall/${callId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Ссылка на звонок скопирована!");
    });
  };

  // Выделение демонстрации экрана
  const screenTrackParticipant = participants.find((p) =>
    Array.from(p.videoTrackPublications.values()).some(pub => pub.source === 'screen_share')
  );

  const otherParticipants = participants.filter(p => p !== screenTrackParticipant);

  return (
    <div className="video-call-container">
      <h1 className="video-call-title">{title}</h1>

      {screenTrackParticipant ? (
        <div className="screen-share-layout">
          <ParticipantView
            participant={screenTrackParticipant}
            isSpeaking={speakingSids.has(screenTrackParticipant.sid)}
          />
          <div className="grid-below">
            {otherParticipants.map((p) => (
              <ParticipantView
                key={p.sid}
                participant={p}
                isSpeaking={speakingSids.has(p.sid)}
                onClick={() => setSelectedParticipant(p)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={getGridClass(participants.length)}>
          {participants.map((p) => (
            <ParticipantView
              key={p.sid}
              participant={p}
              isSpeaking={speakingSids.has(p.sid)}
              onClick={() => setSelectedParticipant(p)}
            />
          ))}
        </div>
      )}

      <div className="controls">
        <button className="control-button" onClick={toggleMic}>
          {micEnabled ? '🔇' : '🎤'}
        </button>
        <button className="control-button" onClick={toggleCam}>
          {camEnabled ? '📷' : '🎥'}
        </button>
        <button className="control-button" onClick={toggleScreenShare}>
          {screenSharing ? '🛑' : '🖥️'}
        </button>
        <button className="control-button" onClick={handleCopyLink}>
          📋
        </button>
        <button className="control-button leave" onClick={leaveRoom}>
          ❌
        </button>
      </div>
      {selectedParticipant && (
  <div className="modal-overlay" onClick={() => setSelectedParticipant(null)}>
    <ParticipantView
      participant={selectedParticipant}
      isSpeaking={speakingSids.has(selectedParticipant.sid)}
      fullscreen
    />
  </div>
)}
    </div>
  );
}
