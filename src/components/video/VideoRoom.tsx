import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, Users, Map, FileText } from 'lucide-react';
import ParticipantsMap from '../maps/ParticipantsMap';
import LiveTranscription from '../transcription/LiveTranscription';
import type { Event } from '../../types';

interface VideoRoomProps {
  roomUrl: string;
  token?: string;
  userName: string;
  event: Event;
  onLeave?: () => void;
}

export default function VideoRoom({ roomUrl, token, userName, event, onLeave }: VideoRoomProps) {
  const callFrame = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showTranscription, setShowTranscription] = useState(false);

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
    callFrame.current.on('participant-joined', (event: any) => {
      console.log('Participant joined:', event);
      updateParticipantCount();
    });

    callFrame.current.on('participant-left', (event: any) => {
      console.log('Participant left:', event);
      updateParticipantCount();
    });

    callFrame.current.on('joined-meeting', (event: any) => {
      console.log('Joined meeting:', event);
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
      const count = Object.keys(participants).length;
      console.log('Participant count updated:', count, participants);
      setParticipantCount(count);
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
      {/* Video, Map, and Transcription Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Video Container */}
        <div className={`${(showMap || showTranscription) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div
            ref={containerRef}
            className="relative bg-gray-900 rounded-lg"
            style={{ height: '600px' }}
          />
        </div>

        {/* Right Panel: Map or Transcription */}
        {(showMap || showTranscription) && (
          <div className="lg:col-span-1" style={{ height: '600px' }}>
            {showMap && !showTranscription && (
              <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                <ParticipantsMap event={event} />
              </div>
            )}

            {showTranscription && !showMap && (
              <div className="h-full">
                <LiveTranscription isActive={showTranscription} />
              </div>
            )}

            {showMap && showTranscription && (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
                  <ParticipantsMap event={event} />
                </div>
                <div className="flex-1">
                  <LiveTranscription isActive={showTranscription} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
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
              onClick={() => setShowMap(!showMap)}
              className={`p-3 rounded-full transition ${
                showMap ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
            >
              <Map className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setShowTranscription(!showTranscription)}
              className={`p-3 rounded-full transition ${
                showTranscription ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={showTranscription ? 'Ocultar transcripción' : 'Mostrar transcripción'}
            >
              <FileText className="w-5 h-5 text-white" />
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
