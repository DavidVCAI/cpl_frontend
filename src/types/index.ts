// User Types
export interface User {
  id: string;
  phone: string;
  name: string;
  stats: UserStats;
  created_at: string;
}

export interface UserStats {
  events_created: number;
  events_attended: number;
  collectibles_count: number;
  total_video_minutes?: number;
}

export interface UserRegisterData {
  phone: string;
  name: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  creator_id: string;
  location: GeoLocation;
  status: 'active' | 'ended' | 'cancelled';
  room: RoomInfo;
  participants: Participant[];
  collectibles_dropped: string[];
  metadata: EventMetadata;
  starts_at: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city: string;
}

export interface RoomInfo {
  daily_room_name?: string;
  daily_room_url?: string;
  max_participants: number;
  current_participants: number;
  is_recording: boolean;
}

export interface Participant {
  user_id: string;
  joined_at: string;
  is_active: boolean;
}

export interface EventMetadata {
  views: number;
  total_minutes: number;
  peak_participants: number;
}

export interface EventCreateData {
  title: string;
  description: string;
  category: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

// Collectible Types
export interface Collectible {
  id: string;
  name: string;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  rarity_score: number;
  image_url?: string;
  description: string;
  event_id: string;
  dropped_at: string;
  expires_at: string;
  claimed_by?: string;
  claimed_at?: string;
  is_active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  [key: string]: any;
}

export interface LocationUpdate extends WSMessage {
  type: 'location_update';
  coordinates: [number, number];
}

export interface NearbyEventsMessage extends WSMessage {
  type: 'nearby_events';
  events: Event[];
  timestamp: string;
}

// Event Categories
export const EVENT_CATEGORIES = [
  'cultura',
  'emergencia',
  'entretenimiento',
  'deportes',
  'educacion',
  'tecnologia',
  'gastronomia',
  'otros',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];
