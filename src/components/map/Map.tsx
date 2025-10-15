// src/components/map/Map.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

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

export function Map({ pings, selectedManifest }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Add CSS to contain Leaflet elements
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 1 !important;
        overflow: hidden !important;
        height: 100% !important;
        width: 100% !important;
        min-height: 100% !important;
        min-width: 100% !important;
      }
      .leaflet-control-container {
        position: relative !important;
        z-index: 2 !important;
      }
      .leaflet-popup {
        z-index: 3 !important;
      }
      .leaflet-tile-container {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle container resize
  useEffect(() => {
    if (!isMapLoaded || !leafletMapRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (leafletMapRef.current && mapRef.current) {
        setTimeout(() => {
          // Force container dimensions
          const container = mapRef.current;
          if (container) {
            container.style.height = '100%';
            container.style.width = '100%';
          }
          leafletMapRef.current.invalidateSize();
        }, 50);
      }
    });

    const handleWindowResize = () => {
      if (leafletMapRef.current) {
        setTimeout(() => {
          leafletMapRef.current.invalidateSize();
        }, 100);
      }
    };

    // Also trigger resize when map loads
    const handleMapLoad = () => {
      if (leafletMapRef.current) {
        setTimeout(() => {
          leafletMapRef.current.invalidateSize();
        }, 200);
      }
    };

    resizeObserver.observe(mapRef.current);
    window.addEventListener('resize', handleWindowResize);
    
    // Trigger initial resize after a short delay
    setTimeout(handleMapLoad, 300);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isMapLoaded]);

  useEffect(() => {
    if (!isClient || !mapRef.current || isMapLoaded) return;

    let mounted = true;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');

        // Fix for default markers in React Leaflet
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mounted || !mapRef.current) return;

        // Ensure container has proper dimensions
        const container = mapRef.current;
        container.style.height = '100%';
        container.style.width = '100%';
        container.style.position = 'relative';
        container.style.display = 'block';

        // Wait a moment for styles to apply
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create map instance
        const map = L.default.map(container, {
          center: [-26.2041, 28.0473], // Johannesburg
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          dragging: true,
          keyboard: true,
          touchZoom: true,
          attributionControl: true,
          // Ensure map fills container properly
          maxBounds: undefined,
          worldCopyJump: false,
          preferCanvas: false,
        });

        // Add tile layer
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        if (mounted) {
          leafletMapRef.current = map;
          setIsMapLoaded(true);
          
          // Force map to resize to fit container with multiple attempts
          const resizeMap = () => {
            if (map && mapRef.current) {
              // Force container dimensions
              const container = mapRef.current;
              if (container) {
                container.style.height = '100%';
                container.style.width = '100%';
                container.style.position = 'relative';
              }
              map.invalidateSize();
            }
          };
          
          // Try multiple times to ensure proper sizing
          setTimeout(resizeMap, 100);
          setTimeout(resizeMap, 300);
          setTimeout(resizeMap, 500);
          setTimeout(resizeMap, 1000);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
        leafletMapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [isClient]);

  useEffect(() => {
    if (!isMapLoaded || !leafletMapRef.current || pings.length === 0) return;

    const updateMarkers = async () => {
      try {
        const L = await import('leaflet');
        
        // Clear existing markers
        leafletMapRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.default.Marker) {
            leafletMapRef.current.removeLayer(layer);
          }
        });

        // Add new markers
        pings.forEach((ping) => {
          const marker = L.default.marker([ping.lat, ping.lng]);
          
          const popupContent = `
            <div class="text-sm">
              <p><strong>Device:</strong> ${ping.device.externalId}</p>
              <p><strong>Speed:</strong> ${ping.speed ? ping.speed.toFixed(1) : 'N/A'} km/h</p>
              <p><strong>Time:</strong> ${new Date(ping.timestamp).toLocaleString()}</p>
              ${ping.heading ? `<p><strong>Heading:</strong> ${ping.heading.toFixed(0)}°</p>` : ''}
            </div>
          `;
          
          marker.bindPopup(popupContent);
          marker.addTo(leafletMapRef.current);
        });

        // Fit bounds to show all markers
        if (pings.length > 0) {
          const bounds = L.default.latLngBounds(
            pings.map(ping => [ping.lat, ping.lng])
          );
          leafletMapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.error('Failed to update markers:', error);
      }
    };

    updateMarkers();
  }, [pings, isMapLoaded]);

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full relative overflow-hidden"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        isolation: 'isolate',
        height: '100%',
        width: '100%',
        minHeight: '100%',
        minWidth: '100%'
      }}
    />
  );
}
