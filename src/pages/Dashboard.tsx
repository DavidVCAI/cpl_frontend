import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MapPin, Calendar, Trophy, User, LogOut, Plus } from 'lucide-react';
import EventsList from '../components/events/EventsList';
import CreateEventModal from '../components/events/CreateEventModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'events' | 'map' | 'collectibles'>('events');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">
                🌆 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">CityPulse</span>
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.phone}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Eventos Creados</p>
                <p className="text-3xl font-bold text-white">{user.stats?.events_created || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-indigo-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Eventos Asistidos</p>
                <p className="text-3xl font-bold text-white">{user.stats?.events_attended || 0}</p>
              </div>
              <User className="w-10 h-10 text-purple-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm">Coleccionables</p>
                <p className="text-3xl font-bold text-white">{user.stats?.collectibles_count || 0}</p>
              </div>
              <Trophy className="w-10 h-10 text-pink-300" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'events'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            Mapa
          </button>
          <button
            onClick={() => setActiveTab('collectibles')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              activeTab === 'collectibles'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Coleccionables
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg shadow-xl min-h-[600px]">
          {activeTab === 'events' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Eventos en Bogotá</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Evento</span>
                </button>
              </div>
              <EventsList />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="p-6">
              <div className="bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Mapa Interactivo</h3>
                  <p className="text-gray-500">Vista del mapa con Mapbox (En desarrollo)</p>
                  <p className="text-sm text-gray-600 mt-2">Mostrará eventos cercanos en tiempo real</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collectibles' && (
            <div className="p-6">
              <div className="bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-600 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Mis Coleccionables</h3>
                  <p className="text-gray-500">Inventario de coleccionables (En desarrollo)</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {user.stats?.collectibles_count || 0} coleccionables obtenidos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
