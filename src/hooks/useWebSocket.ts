import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface WSMessage {
  type: string;
  [key: string]: unknown;
}

interface UserLocation {
  user_id: string;
  coordinates: [number, number]; // [lng, lat]
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface UseWebSocketReturn {
  sendMessage: (message: WSMessage) => void;
  isConnected: boolean;
  locations: Map<string, UserLocation>;
  updateLocation: (coordinates: [number, number], accuracy?: number, speed?: number, heading?: number) => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// Helper to validate location update messages
const isValidLocationUpdate = (message: WSMessage): boolean => {
  return (
    typeof message.user_id === 'string' &&
    Array.isArray(message.coordinates) &&
    message.coordinates.length === 2 &&
    typeof message.timestamp === 'string'
  );
};

export const useWebSocket = (): UseWebSocketReturn => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [locations, setLocations] = useState<Map<string, UserLocation>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const handleLocationUpdate = useCallback((location: UserLocation) => {
    setLocations((prev) => {
      const newLocations = new Map(prev);
      newLocations.set(location.user_id, location);
      return newLocations;
    });
  }, []);

  const handleNearbyUsers = useCallback((users: UserLocation[]) => {
    setLocations((prev) => {
      const newLocations = new Map(prev);
      users.forEach((user) => {
        newLocations.set(user.user_id, user);
      });
      return newLocations;
    });
  }, []);

  const handleUserDisconnected = useCallback((userId: string) => {
    setLocations((prev) => {
      const newLocations = new Map(prev);
      newLocations.delete(userId);
      return newLocations;
    });
  }, []);

  const connect = useCallback(() => {
    if (!user?.id) {
      console.log('❌ No user ID available for WebSocket connection');
      return;
    }

    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      console.log(`🔌 Connecting to WebSocket: ${WS_URL}/ws/${user.id}`);
      const ws = new WebSocket(`${WS_URL}/ws/${user.id}`);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message.type);

          // Handle different message types
          switch (message.type) {
            case 'location_update':
              if (isValidLocationUpdate(message)) {
                handleLocationUpdate(message as unknown as UserLocation);
              }
              break;
            case 'nearby_users':
              if (Array.isArray(message.users)) {
                handleNearbyUsers(message.users as UserLocation[]);
              }
              break;
            case 'user_disconnected':
              if (typeof message.user_id === 'string') {
                handleUserDisconnected(message.user_id);
              }
              break;
            case 'nearby_events':
              console.log('📍 Nearby events:', message.events);
              break;
            case 'error':
              console.error('❌ Server error:', message.message);
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          reconnectTimeoutRef.current = window.setTimeout(connect, reconnectDelay);
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [user?.id, handleLocationUpdate, handleNearbyUsers, handleUserDisconnected]);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('📤 Message sent:', message.type);
    } else {
      console.warn('⚠️ WebSocket not connected. Cannot send message.');
    }
  }, []);

  const updateLocation = useCallback((
    coordinates: [number, number],
    accuracy?: number,
    speed?: number,
    heading?: number
  ) => {
    sendMessage({
      type: 'location_update',
      coordinates,
      accuracy,
      speed,
      heading,
      timestamp: new Date().toISOString(),
    });
  }, [sendMessage]);

  useEffect(() => {
    // Only connect if we have a user ID and NOT already connected
    if (user?.id && !wsRef.current) {
      connect();
    }

    return () => {
      // Cleanup ONLY on unmount (when user?.id changes or component unmounts)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // IMPORTANT: Only depend on user?.id to prevent reconnection loops
    // connect() is stable because its dependencies (callbacks) have no deps
  }, [user?.id]);

  return {
    sendMessage,
    isConnected,
    locations,
    updateLocation,
  };
};
