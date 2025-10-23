import type { Event } from '../../types';
import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cultura: 'bg-purple-500',
      emergencia: 'bg-red-500',
      entretenimiento: 'bg-pink-500',
      deportes: 'bg-green-500',
      educacion: 'bg-blue-500',
      tecnologia: 'bg-indigo-500',
      gastronomia: 'bg-yellow-500',
      otros: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
          • En vivo
        </span>
      );
    }
    if (status === 'ended') {
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full border border-gray-500/30">
          Finalizado
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 hover:border-indigo-500 transition cursor-pointer transform hover:scale-105 duration-200"
    >
      {/* Header */}
      <div className={`${getCategoryColor(event.category)} h-2`} />

      {/* Content */}
      <div className="p-4">
        {/* Title & Status */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white line-clamp-1">{event.title}</h3>
          {getStatusBadge(event.status)}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

        {/* Info Grid */}
        <div className="space-y-2 text-sm">
          {/* Category */}
          <div className="flex items-center text-gray-400">
            <span className={`${getCategoryColor(event.category)} w-2 h-2 rounded-full mr-2`} />
            <span className="capitalize">{event.category}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{event.location.address || 'Bogotá, Colombia'}</span>
          </div>

          {/* Date */}
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(new Date(event.starts_at), "PPP 'a las' p", { locale: es })}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {event.room.current_participants}/{event.room.max_participants} participantes
            </span>
          </div>
        </div>

        {/* Action Button */}
        {event.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}`);
            }}
            className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
          >
            <Video className="w-4 h-4" />
            <span>Unirse ahora</span>
          </button>
        )}
      </div>
    </div>
  );
}
