import { useParams } from 'react-router-dom';
import {VideoRoom} from "./VideoRoom.tsx";


export default function VideoRoomWrapper() {
  const { callId } = useParams<{ callId: string }>();
  if (!callId) return <p>Call ID not provided</p>;
  return <VideoRoom callId={parseInt(callId)} />;
}
