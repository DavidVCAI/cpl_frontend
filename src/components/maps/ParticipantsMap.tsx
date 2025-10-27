import { useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useWebSocket } from "../../hooks/useWebSocket";
import type { Event } from "../../types";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = { lat: 4.711, lng: -74.0721 }; // Bogotá

interface ParticipantsMapProps {
  event: Event;
}

export default function ParticipantsMap({ event }: ParticipantsMapProps) {
  const { locations } = useWebSocket();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script-participants",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // Filter locations to show only event participants
  const participantLocations = useMemo(() => {
    const participantIds = event.participants.map(p => p.user_id);
    const locationsArray = Array.from(locations.values());
    return locationsArray.filter(loc => participantIds.includes(loc.user_id));
  }, [locations, event.participants]);

  // Calculate map center from participant locations or use event location
  const mapCenter = useMemo(() => {
    if (participantLocations.length > 0) {
      // Center on first participant
      return {
        lat: participantLocations[0].coordinates[1],
        lng: participantLocations[0].coordinates[0],
      };
    }
    // Fallback to event location
    return {
      lat: event.location.coordinates[1],
      lng: event.location.coordinates[0],
    };
  }, [participantLocations, event.location]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-gray-400 text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Status indicator */}
      <div className="absolute top-2 left-2 z-10">
        <div className="px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium bg-indigo-600 text-white">
          👥 {participantLocations.length} participante{participantLocations.length !== 1 ? 's' : ''} en el mapa
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
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
        {/* Event location marker */}
        <Marker
          position={{ lat: event.location.coordinates[1], lng: event.location.coordinates[0] }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
          title={event.title}
        />

        {/* Participant markers */}
        {participantLocations.map((loc) => (
          <Marker
            key={loc.user_id}
            position={{ lat: loc.coordinates[1], lng: loc.coordinates[0] }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(30, 30),
            }}
            title={`Participante ${loc.user_id.slice(0, 8)}`}
            animation={google.maps.Animation.DROP}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
