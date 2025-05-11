import { Participant, Track, TrackPublication } from 'livekit-client';
import { useEffect, useRef } from 'react';
import "./ParticipiantView.css";

export function ParticipantView({
  participant,
  isSpeaking,
  onClick,
  fullscreen = false,

}: {
  participant: Participant;
  isSpeaking: boolean;
  username: string;
  onClick?: () => void;
  fullscreen: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleTrackSubscribed = (track: Track) => {
      if (track.kind === 'video' && videoRef.current) {
        track.attach(videoRef.current);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === 'video' && videoRef.current) {
        track.detach(videoRef.current);
      }
    };

    // Подписка на уже имеющиеся треки
    participant.getTrackPublications().forEach((pub: TrackPublication) => {
      if (pub.isSubscribed && pub.track?.kind === 'video') {
        handleTrackSubscribed(pub.track);
      }
    });

    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);

    return () => {
      participant.off('trackSubscribed', handleTrackSubscribed);
      participant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [participant]);

  return (
      <div
          className={`participant ${isSpeaking ? 'speaking' : ''} ${fullscreen ? 'fullscreen-video' : ''}`}
          onClick={onClick}
      >
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted={participant.isLocal}/>
          {!fullscreen && (
              <p className="video-label">{participant.isLocal ? 'Вы' : participant.name}</p>
          )}
        </div>
      </div>

  );
}
