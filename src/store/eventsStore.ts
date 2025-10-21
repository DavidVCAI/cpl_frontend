import { create } from 'zustand';
import type { Event } from '../types';

interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  setSelectedEvent: (event: Event | null) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  selectedEvent: null,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
    })),
}));
