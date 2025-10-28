import {useEffect, useRef, useState, memo} from 'react';
import DailyIframe from '@daily-co/daily-js';
import {Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, Users, FileText, Map} from 'lucide-react';
import type {Event} from '../../types';
import LiveTranscription from '../transcription/LiveTranscription';
import ParticipantsMap from '../maps/ParticipantsMap';
import {CollectibleOverlay} from "@/components/collectible/CollectibleOverlay.tsx";
import { useCollectibles } from "@/hooks/useCollectibles";
import { collectibleImages } from "@/constants/collectibleImages";
import { collectiblesService } from "@/services/collectibles";


interface VideoRoomProps {
    roomUrl: string;
    token?: string;
    userName: string;
    event: Event;
    onLeave?: () => void;
}

function VideoRoom({roomUrl, token, userName, event, onLeave}: VideoRoomProps) {
    const callFrame = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [showTranscription, setShowTranscription] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [activeCollectible, setActiveCollectible] = useState<any | null>(null);
    const [showCollectible, setShowCollectible] = useState(false);
    const { collectibles } = useCollectibles(event.id);


    useEffect(() => {
        if (!containerRef.current) return;

        // Crear el frame de la llamada
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

        // Unirse a la llamada
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

        // Listeners de eventos
        callFrame.current.on('participant-joined', () => updateParticipantCount());
        callFrame.current.on('participant-left', () => updateParticipantCount());
        callFrame.current.on('joined-meeting', () => updateParticipantCount());
        callFrame.current.on('left-meeting', () => {
            if (onLeave) onLeave();
        });

        return () => {
            callFrame.current?.destroy();
        };
    }, [roomUrl, token, userName]);

    useEffect(() => {
        if (!collectibles || collectibles.length === 0) return;

        const latest = collectibles[0];
        if (!latest) return;

        setActiveCollectible({
            id: latest._id,
            name: latest.name,
            rarity: latest.type,
            description: latest.description,
            image: collectibleImages[latest.type] || collectibleImages.common,
        });

        setShowCollectible(true);
    }, [collectibles]);



    const updateParticipantCount = () => {
        if (callFrame.current) {
            const participants = callFrame.current.participants();
            const count = Object.keys(participants).length;
            console.log('Participant count updated:', count, participants);
            setParticipantCount(count);
        }
    };

    const handleClaimCollectible = async (id: string) => {
        try {
            await collectiblesService.claim(id, userName);
            setShowCollectible(false);
        } catch (err) {
            console.error("Error al reclamar:", err);
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
            {/* Video Container with optional transcription and map panels */}
            <div className="p-4">
                <div className={`grid gap-4 ${
                    showTranscription && showMap ? 'grid-cols-3' :
                        (showTranscription || showMap) ? 'grid-cols-2' :
                            'grid-cols-1'
                }`}>
                    {/* Video */}
                    <div
                        ref={containerRef}
                        className="relative bg-gray-900 rounded-lg overflow-hidden"
                        style={{height: '600px', width: '100%'}}
                    >
                        {/* Overlay del coleccionable */}
                        {activeCollectible && (
                            <CollectibleOverlay
                                collectible={activeCollectible}
                                visible={showCollectible}
                                onClaim={handleClaimCollectible}
                                onClose={() => setShowCollectible(false)}
                            />
                        )}

                    </div>


                    {/* Transcription Panel */}
                    {showTranscription && (
                        <div style={{height: '600px'}}>
                            <LiveTranscription isActive={showTranscription}/>
                        </div>
                    )}

                    {/* Map Panel */}
                    {showMap && (
                        <div style={{height: '600px'}}>
                            <ParticipantsMap event={event}/>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                    {/* Left: Participant count */}
                    <div className="flex items-center space-x-2 text-gray-300">
                        <Users className="w-5 h-5"/>
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
                            {isMuted ? <MicOff className="w-5 h-5 text-white"/> :
                                <Mic className="w-5 h-5 text-white"/>}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-3 rounded-full transition ${
                                isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
                        >
                            {isVideoOff ? <VideoOff className="w-5 h-5 text-white"/> :
                                <VideoIcon className="w-5 h-5 text-white"/>}
                        </button>

                        <button
                            onClick={startScreenShare}
                            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                            title="Compartir pantalla"
                        >
                            <Monitor className="w-5 h-5 text-white"/>
                        </button>

                        <button
                            onClick={leaveCall}
                            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition"
                            title="Salir de la llamada"
                        >
                            <PhoneOff className="w-5 h-5 text-white"/>
                        </button>
                    </div>

                    {/* Right: Map and Transcription toggles */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`p-3 rounded-full transition ${
                                showMap ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
                        >
                            <Map className="w-5 h-5 text-white"/>
                        </button>
                        <button
                            onClick={() => setShowTranscription(!showTranscription)}
                            className={`p-3 rounded-full transition ${
                                showTranscription ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={showTranscription ? 'Ocultar transcripción' : 'Mostrar transcripción'}
                        >
                            <FileText className="w-5 h-5 text-white"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Memoize to prevent re-renders when parent updates
export default memo(VideoRoom, (prevProps, nextProps) => {
    // Only re-render if these critical props change
    return (
        prevProps.roomUrl === nextProps.roomUrl &&
        prevProps.token === nextProps.token &&
        prevProps.userName === nextProps.userName
    );
});
