// src/components/map/Map.tsx
'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

interface LocationPing {
  id: string;
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  device: {
    id: string;
    externalId: string;
  };
}

interface MapProps {
  pings: LocationPing[];
  selectedManifest?: string | null;
}

// Fix for default markers in React Leaflet
// See: https://github.com/PaulLeCam/react-leaflet/issues/453#issuecomment-704170300
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map bounds fitting
function MapBounds({ pings }: { pings: LocationPing[] }) {
  const map = useMap();

  useEffect(() => {
    if (pings.length > 0) {
      const bounds = L.latLngBounds(
        pings.map(ping => [ping.lat, ping.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, pings]);

  return null;
}

// Error boundary component for map errors
function MapErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Map failed to load</p>
          <button 
            onClick={() => setHasError(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Map({ pings }: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className="h-full w-full relative overflow-hidden">
        <MapContainer
          center={[-26.2041, 28.0473]} // Johannesburg
          zoom={10}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          dragging={true}
          keyboard={true}
          touchZoom={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render markers */}
          {pings.map((ping) => (
            <Marker key={ping.id} position={[ping.lat, ping.lng]}>
              <Popup>
                <div className="text-sm">
                  <p><strong>Device:</strong> {ping.device.externalId}</p>
                  <p><strong>Speed:</strong> {ping.speed ? ping.speed.toFixed(1) : 'N/A'} km/h</p>
                  <p><strong>Time:</strong> {new Date(ping.timestamp).toLocaleString()}</p>
                  {ping.heading && <p><strong>Heading:</strong> {ping.heading.toFixed(0)}°</p>}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Handle bounds fitting */}
          <MapBounds pings={pings} />
        </MapContainer>
      </div>
    </MapErrorBoundary>
  );
}
