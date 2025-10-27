import { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import { useRealTimeLocation } from "../../hooks/useRealTimeLocation";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAuthStore } from "../../store/authStore";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = { lat: 4.711, lng: -74.0721 }; // Bogotá

export default function MapView() {
  const { user } = useAuthStore();
  const { currentLocation, error: locationError, isTracking } = useRealTimeLocation();
  const { locations, isConnected } = useWebSocket();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

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
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
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
      </GoogleMap>
    </div>
  );
}
