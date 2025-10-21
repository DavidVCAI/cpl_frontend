import { useEffect, useState } from 'react';
import { useEventsStore } from '../../store/eventsStore';
import { eventsService } from '../../services/events';
import EventCard from './EventCard';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function EventsList() {
  const { events, setEvents } = useEventsStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('active');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // For MVP: Get events near Bogotá center
      const bogotaCenter: [number, number] = [-74.0721, 4.7110];
      const fetchedEvents = await eventsService.getNearbyEvents(
        bogotaCenter[0],
        bogotaCenter[1],
        50000 // 50km radius to get more events for demo
      );
      setEvents(fetchedEvents);
    } catch (error: any) {
      toast.error('Error al cargar eventos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="ml-3 text-gray-400">Cargando eventos...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Activos
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'ended'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Finalizados
        </button>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay eventos {filter !== 'all' && filter}s</p>
          <p className="text-gray-500 text-sm mt-2">Crea el primer evento de la comunidad</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadEvents}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
