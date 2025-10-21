import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { eventsService } from '../services/events';
import type { Event } from '../types';
import { ArrowLeft, Calendar, MapPin, Users, Video, Loader2, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const data = await eventsService.getEvent(eventId);
      setEvent(data);
    } catch (error: any) {
      toast.error('Error al cargar el evento');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!event || !user) return;

    setJoining(true);
    try {
      const response = await eventsService.joinEvent(event.id, user.id);
      toast.success('¡Te has unido al evento!');

      // For MVP: Show alert about video room (will be implemented later)
      toast.success(`Sala de video: ${response.room_url}`, { duration: 5000 });

      // TODO: Navigate to video room page when implemented
      // navigate(`/events/${event.id}/room`, { state: { token: response.token } });

    } catch (error: any) {
      toast.error(error.message || 'Error al unirse al evento');
    } finally {
      setJoining(false);
    }
  };

  const handleEndEvent = async () => {
    if (!event || !user) return;

    if (event.creator_id !== user.id) {
      toast.error('Solo el creador puede finalizar el evento');
      return;
    }

    if (confirm('¿Estás seguro de que quieres finalizar este evento?')) {
      try {
        await eventsService.endEvent(event.id, user.id);
        toast.success('Evento finalizado');
        navigate('/dashboard');
      } catch (error: any) {
        toast.error(error.message || 'Error al finalizar evento');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="ml-3 text-gray-400">Cargando evento...</span>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isCreator = user?.id === event.creator_id;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30 capitalize">
                  {event.category}
                </span>
                {event.status === 'active' && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                    • En vivo
                  </span>
                )}
                {isCreator && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                    👑 Tu evento
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg mb-6">{event.description}</p>

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-300">
              <Calendar className="w-5 h-5 mr-3 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha y hora</p>
                <p className="font-medium">{format(new Date(event.starts_at), "PPP 'a las' p", { locale: es })}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <MapPin className="w-5 h-5 mr-3 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-medium">{event.location.address || 'Bogotá, Colombia'}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <Users className="w-5 h-5 mr-3 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-500">Participantes</p>
                <p className="font-medium">
                  {event.room.current_participants} / {event.room.max_participants}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <Trophy className="w-5 h-5 mr-3 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-500">Coleccionables</p>
                <p className="font-medium">{event.collectibles_dropped.length} disponibles</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {event.status === 'active' && !isCreator && (
              <button
                onClick={handleJoinEvent}
                disabled={joining}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Video className="w-5 h-5" />
                <span>{joining ? 'Uniéndose...' : 'Unirse al Evento'}</span>
              </button>
            )}

            {isCreator && event.status === 'active' && (
              <>
                <button
                  onClick={handleJoinEvent}
                  disabled={joining}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <Video className="w-5 h-5" />
                  <span>Entrar a la Sala</span>
                </button>
                <button
                  onClick={handleEndEvent}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                  Finalizar Evento
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Vistas</p>
            <p className="text-3xl font-bold text-white">{event.metadata.views}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Duración Total</p>
            <p className="text-3xl font-bold text-white">{event.metadata.total_minutes} min</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-1">Pico de Participantes</p>
            <p className="text-3xl font-bold text-white">{event.metadata.peak_participants}</p>
          </div>
        </div>

        {/* Video Room Placeholder */}
        <div className="mt-6 bg-gray-800 rounded-lg p-8">
          <div className="bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600 h-96 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Sala de Video</h3>
              <p className="text-gray-500">Componente de Daily.co (En desarrollo)</p>
              <p className="text-sm text-gray-600 mt-2">Se implementará en la siguiente fase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
