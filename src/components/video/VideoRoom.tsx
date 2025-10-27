import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, Users } from 'lucide-react';

interface VideoRoomProps {
  roomUrl: string;
  token?: string;
  userName: string;
  onLeave?: () => void;
}

export default function VideoRoom({ roomUrl, token, userName, onLeave }: VideoRoomProps) {
  const callFrame = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Daily.co call frame
    callFrame.current = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px',
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    });

    // Join the call
    const joinCall = async () => {
      try {
        await callFrame.current?.join({
          url: roomUrl,
          token,
          userName,
        });
      } catch (err: any) {
        console.error('Error joining call:', err);
        setError('Error al unirse a la sala de video');
      }
    };

    joinCall();

    // Event listeners
    callFrame.current.on('participant-joined', () => {
      updateParticipantCount();
    });

    callFrame.current.on('participant-left', () => {
      updateParticipantCount();
    });

    callFrame.current.on('left-meeting', () => {
      if (onLeave) onLeave();
    });

    return () => {
      callFrame.current?.destroy();
    };
  }, [roomUrl, token, userName]);

  const updateParticipantCount = () => {
    if (callFrame.current) {
      const participants = callFrame.current.participants();
      setParticipantCount(Object.keys(participants).length);
    }
  };

  const toggleMute = () => {
    if (callFrame.current) {
      callFrame.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (callFrame.current) {
      callFrame.current.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const startScreenShare = async () => {
    if (callFrame.current) {
      try {
        await callFrame.current.startScreenShare();
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    }
  };

  const leaveCall = () => {
    if (callFrame.current) {
      callFrame.current.leave();
    }
  };

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-t-lg"
        style={{ height: '600px' }}
      />

      {/* Controls */}
      <div className="bg-gray-800 p-4 rounded-b-lg">
        <div className="flex items-center justify-between">
          {/* Left: Participant count */}
          <div className="flex items-center space-x-2 text-gray-300">
            <Users className="w-5 h-5" />
            <span className="text-sm">{participantCount} participantes</span>
          </div>

          {/* Center: Call controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition ${
                isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <VideoIcon className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={startScreenShare}
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              title="Compartir pantalla"
            >
              <Monitor className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={leaveCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition"
              title="Salir de la llamada"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Right: Empty for symmetry */}
          <div className="w-32"></div>
        </div>
      </div>
    </div>
  );
}
