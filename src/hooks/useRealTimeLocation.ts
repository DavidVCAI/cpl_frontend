import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

interface UseRealTimeLocationReturn {
  currentLocation: LocationData | null;
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

const HIGH_ACCURACY = true;
const MAX_AGE = 0; // Don't use cached position
const TIMEOUT = 10000; // 10 seconds

export const useRealTimeLocation = (): UseRealTimeLocationReturn => {
  const { updateLocation, isConnected } = useWebSocket();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const locationData: LocationData = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed ?? undefined,
      heading: position.coords.heading ?? undefined,
      timestamp: position.timestamp,
    };

    setCurrentLocation(locationData);
    setError(null);

    // Send to WebSocket if connected
    if (isConnected) {
      updateLocation(
        [locationData.lng, locationData.lat], // [lng, lat] format for backend
        locationData.accuracy,
        locationData.speed,
        locationData.heading
      );
    }
  }, [isConnected, updateLocation]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error getting location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }

    console.error('Geolocation error:', errorMessage, error);
    setError(errorMessage);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);

    const options: PositionOptions = {
      enableHighAccuracy: HIGH_ACCURACY,
      maximumAge: MAX_AGE,
      timeout: TIMEOUT,
    };

    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    console.log('✅ Location tracking started');
  }, [handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
    console.log('🛑 Location tracking stopped');
  }, []);

  // Auto-start tracking when component mounts
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return {
    currentLocation,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
};
