import { useEffect, useState, useRef } from 'react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Mic, MicOff, FileText } from 'lucide-react';
import axios from 'axios';

interface Transcript {
  text: string;
  timestamp: Date;
  speaker?: string;
  isFinal: boolean;
}

interface LiveTranscriptionProps {
  isActive: boolean;
}

export default function LiveTranscription({ isActive }: LiveTranscriptionProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const deepgramRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcripts, currentTranscript]);

  const startTranscription = async () => {
    try {
      setError(null);

      // Get Deepgram API key from backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const tokenResponse = await axios.get(`${apiUrl}/api/transcription/token`);
      const { key } = tokenResponse.data;

      // Initialize Deepgram client
      deepgramRef.current = createClient(key);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      // Create Deepgram connection
      const connection = deepgramRef.current.listen.live({
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true,
        interim_results: true,
      });

      connectionRef.current = connection;

      // Handle transcription events
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
        setIsRecording(true);

        // Create MediaRecorder to send audio
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });

        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && connection.getReadyState() === 1) {
            connection.send(event.data);
          }
        });

        mediaRecorderRef.current.start(250); // Send data every 250ms
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel.alternatives[0].transcript;

        if (transcript && transcript.trim() !== '') {
          const isFinal = data.is_final;

          if (isFinal) {
            // Add final transcript to history
            setTranscripts(prev => [
              ...prev,
              {
                text: transcript,
                timestamp: new Date(),
                isFinal: true
              }
            ]);
            setCurrentTranscript('');
          } else {
            // Update current interim transcript
            setCurrentTranscript(transcript);
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
        setError('Error en la transcripción');
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        setIsRecording(false);
      });

    } catch (err: any) {
      console.error('Error starting transcription:', err);
      setError('No se pudo iniciar la transcripción. Verifica los permisos del micrófono.');
      setIsRecording(false);
    }
  };

  const stopTranscription = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (connectionRef.current) {
      connectionRef.current.finish();
    }

    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Transcripción en Vivo</h3>
        </div>

        <button
          onClick={isRecording ? stopTranscription : startTranscription}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Detener</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Iniciar</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-green-400">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>Escuchando...</span>
        </div>
      )}

      {/* Transcripts */}
      <div className="flex-1 overflow-y-auto space-y-3 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        {transcripts.length === 0 && !currentTranscript && (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Presiona "Iniciar" para comenzar la transcripción</p>
            <p className="text-xs mt-2">La transcripción aparecerá aquí en tiempo real</p>
          </div>
        )}

        {transcripts.map((transcript, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-indigo-500">
            <p className="text-white text-sm leading-relaxed">{transcript.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {transcript.timestamp.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        ))}

        {/* Current interim transcript */}
        {currentTranscript && (
          <div className="bg-gray-700/50 rounded-lg p-3 border-l-4 border-yellow-500 opacity-70">
            <p className="text-white text-sm leading-relaxed italic">{currentTranscript}</p>
            <p className="text-xs text-gray-500 mt-1">Transcribiendo...</p>
          </div>
        )}

        <div ref={transcriptsEndRef} />
      </div>

      {/* Info */}
      {isRecording && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          💡 Los textos en amarillo son temporales. Los finales aparecen en morado.
        </div>
      )}
    </div>
  );
}
