import { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { useRealTimeLocation } from "../../hooks/useRealTimeLocation";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";
import { useEventsStore } from "../../store/eventsStore";
import { eventsService } from "../../services/events";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../types";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = { lat: 4.711, lng: -74.0721 }; // Bogotá

interface MapViewProps {
  onMapClick?: (coordinates: [number, number]) => void;
}

export default function MapView({ onMapClick }: MapViewProps = {}) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { currentLocation, error: locationError, isTracking } = useRealTimeLocation();
  const { locations, isConnected } = useWebSocket();
  const { events, setEvents } = useEventsStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // Fetch events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Fetch all events (active and ended) near Bogotá
      const bogotaCenter: [number, number] = [-74.0721, 4.7110];
      const fetchedEvents = await eventsService.getNearbyEvents(
        bogotaCenter[0],
        bogotaCenter[1],
        50000 // 50km radius
      );
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  // Update map center when current location is available
  useEffect(() => {
    if (currentLocation) {
      setMapCenter({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });
    }
  }, [currentLocation]);

  // Convert locations Map to array for rendering
  const otherUsersLocations = useMemo(() => {
    const locationsArray = Array.from(locations.values());
    // Filter out current user
    return locationsArray.filter(loc => loc.user_id !== user?.id);
  }, [locations, user?.id]);

  // Filter only active events for map display
  const activeEvents = useMemo(() => {
    return events.filter(event => event.status === 'active');
  }, [events]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-gray-400 text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Status indicators */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {/* Connection status */}
        <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>

        {/* Tracking status */}
        {isTracking && (
          <div className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium bg-blue-500 text-white">
            📍 Rastreando ubicación
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium bg-yellow-500 text-white max-w-xs">
            ⚠️ {locationError}
          </div>
        )}

        {/* Users count */}
        <div className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium bg-gray-800 text-white">
          👥 {otherUsersLocations.length} usuarios cerca
        </div>

        {/* Events count */}
        <div className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium bg-indigo-600 text-white">
          📍 {activeEvents.length} eventos activos
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onClick={(e) => {
          if (onMapClick && e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onMapClick([lng, lat]); // [lng, lat] format
          }
        }}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              elementType: "geometry",
              stylers: [{ color: "#242f3e" }],
            },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#242f3e" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {/* Marker del usuario actual */}
        {currentLocation && (
          <Marker
            position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(40, 40),
            }}
            title="Tu ubicación"
            animation={google.maps.Animation.DROP}
          />
        )}

        {/* Marcadores de otros usuarios */}
        {otherUsersLocations.map((loc) => (
          <Marker
            key={loc.user_id}
            position={{ lat: loc.coordinates[1], lng: loc.coordinates[0] }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(35, 35),
            }}
            title={`Usuario ${loc.user_id.slice(0, 8)}`}
            animation={google.maps.Animation.DROP}
            onClick={() => setSelectedUser(loc.user_id)}
          />
        ))}

        {/* Event markers */}
        {activeEvents.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.location.coordinates[1], lng: event.location.coordinates[0] }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(45, 45),
            }}
            title={event.title}
            animation={google.maps.Animation.BOUNCE}
            onClick={() => setSelectedEvent(event)}
          />
        ))}

        {/* Info window for selected user */}
        {selectedUser && locations.has(selectedUser) && (
          <InfoWindow
            position={{
              lat: locations.get(selectedUser)!.coordinates[1],
              lng: locations.get(selectedUser)!.coordinates[0],
            }}
            onCloseClick={() => setSelectedUser(null)}
          >
            <div className="p-2 text-gray-900">
              <h3 className="font-bold mb-1">Usuario {selectedUser.slice(0, 8)}</h3>
              <p className="text-xs text-gray-600">
                📍 {locations.get(selectedUser)!.coordinates[1].toFixed(6)}, {locations.get(selectedUser)!.coordinates[0].toFixed(6)}
              </p>
              {locations.get(selectedUser)!.accuracy && (
                <p className="text-xs text-gray-600">
                  🎯 Precisión: {Math.round(locations.get(selectedUser)!.accuracy!)}m
                </p>
              )}
              {locations.get(selectedUser)!.speed && (
                <p className="text-xs text-gray-600">
                  🚀 Velocidad: {(locations.get(selectedUser)!.speed! * 3.6).toFixed(1)} km/h
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                🕐 {new Date(locations.get(selectedUser)!.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </InfoWindow>
        )}

        {/* Info window for selected event */}
        {selectedEvent && (
          <InfoWindow
            position={{
              lat: selectedEvent.location.coordinates[1],
              lng: selectedEvent.location.coordinates[0],
            }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <div className="p-3 text-gray-900 max-w-xs">
              <h3 className="font-bold text-lg mb-2">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{selectedEvent.description}</p>
              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-600">
                  📍 {selectedEvent.location.address || 'Bogotá, Colombia'}
                </p>
                <p className="text-xs text-gray-600">
                  👥 {selectedEvent.room.current_participants}/{selectedEvent.room.max_participants} participantes
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  🏷️ {selectedEvent.category}
                </p>
              </div>
              <button
                onClick={() => navigate(`/events/${selectedEvent.id}`)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition"
              >
                Ver Evento
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
