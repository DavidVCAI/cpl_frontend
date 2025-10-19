# CityPulse Live - Frontend (MVP)

Real-time civic engagement platform for Bogotá - React + TypeScript Frontend

## 🎯 MVP Features

This is a simplified MVP focusing on the core user stories:

1. **User Registration** - Simple phone + name registration
2. **Interactive Map** - Mapbox GL JS with real-time event markers
3. **Geolocation** - Browser geolocation + WebSocket updates
4. **Video Conferencing** - Daily.co embedded video rooms
5. **Collectibles** - Real-time race condition claiming UI
6. **AI Transcription Display** - Live transcription from Deepgram

## 🛠 Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Mapbox GL JS** - Interactive maps
- **Daily.co SDK** - Video conferencing
- **Socket.IO Client** - WebSocket communication
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
cpl_frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Registration/login
│   │   ├── map/          # Mapbox map component
│   │   ├── events/       # Event list/cards
│   │   ├── video/        # Daily.co video room
│   │   └── collectibles/ # Collectible claiming UI
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useWebSocket.ts
│   │   ├── useGeolocation.ts
│   │   ├── useDaily.ts
│   │   └── useAuth.ts
│   │
│   ├── services/         # API client
│   │   ├── api.ts
│   │   ├── events.ts
│   │   ├── users.ts
│   │   └── collectibles.ts
│   │
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── WebSocketContext.tsx
│   │
│   ├── pages/            # Route pages
│   │   ├── Home.tsx
│   │   ├── EventDetail.tsx
│   │   └── Profile.tsx
│   │
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/            # Helper functions
│   │   └── constants.ts
│   │
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)
- Mapbox API token

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd cpl_frontend

# Install dependencies
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Mapbox
VITE_MAPBOX_TOKEN=pk.eyJ1...your_token_here
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 5. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## 🗺️ Key Components to Implement

### 1. Map Component (Mapbox)

```tsx
// src/components/map/MapContainer.tsx
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Features:
// - Show user's current location
// - Display event markers
// - Real-time updates via WebSocket
// - Click event markers to see details
```

### 2. Video Room Component (Daily.co)

```tsx
// src/components/video/VideoRoom.tsx
import DailyIframe from '@daily-co/daily-js';

// Features:
// - Join video call with token
// - Display up to 15 participants
// - Leave call button
// - Real-time transcription display
```

### 3. WebSocket Hook

```tsx
// src/hooks/useWebSocket.ts
import { io } from 'socket.io-client';

// Features:
// - Connect to WebSocket server
// - Send/receive location updates
// - Handle collectible drops
// - Chat messages
```

### 4. Geolocation Hook

```tsx
// src/hooks/useGeolocation.ts

// Features:
// - Request browser geolocation
// - Watch position changes
// - Send updates to WebSocket
```

### 5. Collectible Claiming UI

```tsx
// src/components/collectibles/CollectibleAlert.tsx

// Features:
// - Show collectible drop notification
// - 30-second countdown timer
// - One-click claim button
// - Success/failure feedback
```

## 📡 API Integration

### API Service Setup

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### User Registration

```typescript
// src/services/users.ts
export const registerUser = async (phone: string, name: string) => {
  const response = await api.post('/api/users/register', { phone, name });
  return response.data;
};
```

### Get Nearby Events

```typescript
// src/services/events.ts
export const getNearbyEvents = async (lng: number, lat: number) => {
  const response = await api.get('/api/events/nearby', {
    params: { lng, lat, max_distance: 5000 },
  });
  return response.data;
};
```

### Join Event

```typescript
export const joinEvent = async (eventId: string, userId: string) => {
  const response = await api.post(`/api/events/${eventId}/join`, null, {
    params: { user_id: userId },
  });
  return response.data; // { room_url, token }
};
```

## 🔌 WebSocket Integration

### Connect to WebSocket

```typescript
// src/hooks/useWebSocket.ts
const socket = io(import.meta.env.VITE_WS_URL, {
  path: `/ws/${userId}`,
});

socket.on('nearby_events', (data) => {
  console.log('Nearby events:', data.events);
});

socket.on('collectible_drop', (data) => {
  showCollectibleAlert(data.collectible);
});
```

### Send Location Updates

```typescript
const updateLocation = (coordinates: [number, number]) => {
  socket.emit('location_update', { coordinates });
};
```

## 🎨 UI/UX Design

### Color Palette (Tailwind)

```javascript
// tailwind.config.js
colors: {
  primary: '#4f46e5',    // Indigo
  secondary: '#9333ea',  // Purple
  accent: '#ec4899',     // Pink
}
```

### Layout

**Desktop:**
- Map: 60% left side
- Event list: 40% right side
- Video room: Full-screen overlay

**Mobile:**
- Full-screen map
- Bottom sheet for events
- Swipe up to see list
- Video room: Full screen

## 🧪 Testing

```bash
# Lint
npm run lint

# Type check
npm run build
```

## 🚢 Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy automatically on git push

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Option 2: Netlify

1. Push code to GitHub
2. New site from Git on [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

## 📋 Development Checklist

### Phase 1: Core Setup (Week 1)
- [x] Initialize Vite project
- [x] Install dependencies
- [x] Configure Tailwind CSS
- [x] Set up TypeScript
- [ ] Create basic layout structure
- [ ] Set up routing

### Phase 2: Authentication (Week 1)
- [ ] Registration form (phone + name)
- [ ] Auth context
- [ ] Store user ID in localStorage

### Phase 3: Map & Geolocation (Week 1)
- [ ] Mapbox map component
- [ ] Browser geolocation hook
- [ ] Display user marker
- [ ] Fetch & display nearby events
- [ ] WebSocket location updates

### Phase 4: Events (Week 2)
- [ ] Event list component
- [ ] Event card component
- [ ] Create event form
- [ ] Event detail page

### Phase 5: Video Conferencing (Week 2)
- [ ] Daily.co integration
- [ ] Video room component
- [ ] Join/leave functionality

### Phase 6: Collectibles (Week 2)
- [ ] Collectible drop notification
- [ ] Claim button
- [ ] Race condition handling
- [ ] Success/failure feedback
- [ ] User inventory view

### Phase 7: AI Transcription (Week 2)
- [ ] Real-time transcript display
- [ ] Speaker labels
- [ ] Transcript history

### Phase 8: Polish (Week 2)
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Performance optimization

## 🤝 Contributing

This is an MVP for a university project.

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 👥 Team Division

Suggested task division:

**Developer 1:**
- Map component
- Geolocation
- WebSocket integration

**Developer 2:**
- Video room component
- Event list/cards
- Routing

**Developer 3:**
- Collectibles UI
- User registration
- Styling/polish

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)
- [Daily.co React SDK](https://docs.daily.co/reference/daily-js)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

## 🔗 Links

- Backend Repository: [Link to cpl_backend]
- API Documentation: http://localhost:8000/docs
- Mapbox Account: https://account.mapbox.com
- Daily.co Dashboard: https://dashboard.daily.co

## 📝 License

MIT License - See LICENSE file for details