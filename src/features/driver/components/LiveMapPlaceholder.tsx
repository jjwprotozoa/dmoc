// src/features/driver/components/LiveMapPlaceholder.tsx
"use client";
// Placeholder map box. Replace with Mapbox/Leaflet later.

export function LiveMapPlaceholder() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center text-sm text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="font-medium">Map placeholder</p>
          <p className="text-xs mt-1">Wire to Traccar/Tive/App later</p>
        </div>
      </div>
    </div>
  );
}

