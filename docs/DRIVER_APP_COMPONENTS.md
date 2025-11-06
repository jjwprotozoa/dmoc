# Driver App Component Integration Guide

## Available Components to Wire

### 🗺️ **Map & Location Tracking**

#### 1. **Map Component** (`src/components/map/Map.tsx`)

- **Purpose**: Full-featured Leaflet map with markers, popups, and real-time location tracking
- **Features**:
  - OpenStreetMap tiles
  - Marker rendering with device info
  - Speed, heading, and timestamp display
  - Auto-fit bounds to show all markers
  - Error boundary for graceful failures
- **Integration**: Replace `LiveMapPlaceholder` in `/driver/trips/[id]/page.tsx`
- **Data needed**: Transform `TrackerSignal` from driver types to `LocationPing` format
- **Example usage**:

```typescript
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/map/Map').then(mod => ({ default: mod.Map })), { ssr: false });

// In trip detail page:
<Map pings={tripPings} />
```

---

### 📱 **Navigation Components**

#### 2. **BottomNav** (`src/components/navigation/BottomNav.tsx`)

- **Purpose**: Mobile-first bottom navigation bar
- **Features**:
  - Theme-aware colors
  - Expandable "More" menu
  - Active route highlighting
- **Integration**: Add to driver layout for quick navigation
- **Customization needed**: Create driver-specific nav items:
  - Home (`/driver`)
  - Active Trips
  - Completed Trips
  - Reports
  - Profile/Settings
- **Location**: Add to `src/app/driver/layout.tsx`

---

### 📊 **Activity & Real-time Components**

#### 3. **ActivityFeed** (`src/components/dashboard/ActivityFeed.tsx`)

- **Purpose**: Real-time activity stream with Socket.IO integration
- **Features**:
  - Live updates via Socket.IO
  - Fallback polling when socket disconnected
  - Activity types: location updates, webhooks, incidents
  - Auto-refresh capabilities
- **Integration**: Add to driver home page or trip detail page
- **Use cases**:
  - Show trip updates (stop reached, status changes)
  - Display real-time notifications
  - Show location pings from tracker
- **Socket events to listen for**:
  - `ping:new` - Location updates
  - `manifest:updated` - Trip status changes
  - `driver:notification` - Driver-specific alerts

---

### 📞 **Communication Components**

#### 4. **CallDialog** (`src/components/ui/call-dialog.tsx`)

- **Purpose**: Phone call initiation with privacy controls
- **Features**:
  - Privacy masking for phone numbers
  - Native dialer integration
  - Formatted phone display
- **Integration**: Add to driver header or trip detail for emergency/dispatch calls
- **Use cases**:
  - Call dispatch/operations
  - Emergency contacts
  - Client contacts at stops
- **Location**: Add button in trip detail page QuickActions or header

---

### 🔔 **Notifications & Alerts**

#### 5. **InstallPrompt** (`src/components/install/InstallPrompt.tsx`)

- **Purpose**: PWA installation prompt for mobile drivers
- **Features**:
  - Detects installability
  - Checks if already installed
  - Native install button
- **Integration**: Already useful for PWA, can customize messaging for drivers
- **Enhancement**: Add driver-specific benefits (offline trip data, push notifications)

---

### 🎯 **UI Utilities**

#### 6. **BackToTop** (`src/components/ui/back-to-top.tsx`)

- **Purpose**: Scroll-to-top button for long pages
- **Features**:
  - Auto-shows after scrolling
  - Smooth scroll animation
  - Theme-aware styling
- **Integration**: Add to driver layout for trip lists and detail pages

---

### 📋 **Form & Input Components** (Already Available)

All shadcn/ui components are already available:

- ✅ `Card`, `CardHeader`, `CardContent` - Already used
- ✅ `Button`, `Input`, `Textarea`, `Select` - Already used
- ✅ `Dialog` - Can use for modals
- ✅ `Badge` - For status indicators (trip state, priority)
- ✅ `Tabs` - For organizing trip details (Overview, Stops, History)
- ✅ `Tooltip` - For help text and hints

---

## Real-time Integration (Socket.IO)

### **useSocket Hook** (`src/hooks/useSocket.ts`)

- **Purpose**: Socket.IO client connection with auto-reconnect
- **Features**:
  - Tenant isolation
  - Connection status tracking
  - Auto-reconnect on failure
  - Multiple transport fallbacks
- **Integration**: Use in driver components for:
  - Live location updates
  - Trip status changes
  - New assignments
  - Push notifications

**Example integration**:

```typescript
import { useSocket } from '@/hooks/useSocket';

function TripDetail({ tripId }: { tripId: string }) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for trip updates
      socket.on(`trip:${tripId}:update`, (update) => {
        // Update trip state
      });

      // Listen for location updates
      socket.on(`trip:${tripId}:location`, (location) => {
        // Update map marker
      });

      return () => {
        socket.off(`trip:${tripId}:update`);
        socket.off(`trip:${tripId}:location`);
      };
    }
  }, [socket, isConnected, tripId]);
}
```

---

## Recommended Integration Priority

### Phase 1: Core Functionality

1. ✅ **Map Component** - Replace placeholder with real map
2. ✅ **BottomNav** - Add driver-specific navigation
3. ✅ **useSocket Hook** - Enable real-time updates

### Phase 2: Enhanced UX

4. **ActivityFeed** - Show trip activity stream
5. **CallDialog** - Add emergency/dispatch calling
6. **BackToTop** - Improve long-page navigation

### Phase 3: PWA & Offline

7. **InstallPrompt** - Already works, enhance messaging
8. Add offline trip data caching (Dexie)
9. Background location sync

---

## Component Integration Examples

### Example 1: Replace Map Placeholder

```typescript
// src/app/driver/trips/[id]/page.tsx
import dynamic from 'next/dynamic';
import { useSocket } from '@/hooks/useSocket';

const Map = dynamic(
  () => import('@/components/map/Map').then(mod => ({ default: mod.Map })),
  { ssr: false }
);

export default async function TripDetail({ params }: { params: { id: string } }) {
  // Transform trip stops/location to LocationPing format
  const pings = trip.stops.map(stop => ({
    id: stop.id,
    lat: stop.lat,
    lng: stop.lng,
    speed: trip.lastSignal?.speedKph || null,
    heading: trip.lastSignal?.headingDeg || null,
    timestamp: trip.lastSignal?.fixTime || new Date().toISOString(),
    device: { id: 'current', externalId: trip.vehicle?.plate || 'Vehicle' }
  }));

  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <Map pings={pings} />
      </div>
      {/* ... rest of page */}
    </div>
  );
}
```

### Example 2: Add Bottom Navigation

```typescript
// src/app/driver/layout.tsx
import { DriverBottomNav } from '@/features/driver/components/DriverBottomNav';

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  // ... existing code ...

  return (
    <ThemeProvider initialTenantSlug={tenantSlug || "digiwize"}>
      <div className="min-h-screen bg-gray-50">
        <DriverHeader ... />
        <main className="pb-16 lg:pb-0">
          <div className="p-6">{children}</div>
        </main>
        <DriverBottomNav />
      </div>
    </ThemeProvider>
  );
}
```

### Example 3: Add Real-time Updates

```typescript
// src/features/driver/components/TripCard.tsx
"use client";

import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

export function TripCard({ trip }: { trip: ManifestTrip }) {
  const { socket, isConnected } = useSocket();
  const [liveTrip, setLiveTrip] = useState(trip);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on(`trip:${trip.id}:update`, (update) => {
        setLiveTrip(prev => ({ ...prev, ...update }));
      });

      return () => {
        socket.off(`trip:${trip.id}:update`);
      };
    }
  }, [socket, isConnected, trip.id]);

  // Use liveTrip instead of trip for rendering
  return (/* ... */);
}
```

---

## Notes

- All components are already styled with Tailwind and match the app theme
- Socket.IO integration requires backend support for driver-specific events
- Map component needs location data transformation from driver types
- BottomNav can be customized with driver-specific routes
- All components are mobile-responsive and PWA-compatible
