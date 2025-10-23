import { useCallback, useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type Location = {
  id: string;
  lat: number;
  lng: number;
};

interface MapViewProps {
  realtimeLocations?: Location[]; // otros usuarios
}

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = { lat: 4.711, lng: -74.0721 }; // Bogotá

export default function MapView({ realtimeLocations = [] }: MapViewProps) {
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string, // define esta variable
  });

  // Obtener ubicación del dispositivo
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, 10000); // cada 10s actualiza
    return () => clearInterval(interval);
  }, [getCurrentLocation]);

  if (!isLoaded) return <div className="text-gray-400 text-center p-4">Cargando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition || defaultCenter}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
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
        ],
      }}
    >
      {/* Marker del dispositivo actual */}
      {currentPosition && (
        <Marker
          position={currentPosition}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

      {/* Marcadores de otros dispositivos */}
      {realtimeLocations.map((loc) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          }}
        />
      ))}
    </GoogleMap>
  );
}
