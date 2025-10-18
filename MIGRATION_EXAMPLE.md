// Example: Updated vehicles page using database queries
// This shows how to replace mock data with TRPC database queries

'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { trpc } from '../../../../lib/trpc';
import { Button } from '../../../../components/ui/button';
// ... other imports

// Memoized Vehicle Card Component (same as before)
const VehicleCard = memo(({
vehicle,
isSelected,
onSelect,
onAction,
getCountryFlag,
getStatusColor,
getFuelStatusColor,
getDaysSinceLastFuel,
isServiceDue,
formatDate
}: {
vehicle: any; // Type from database
isSelected: boolean;
onSelect: (id: string) => void;
onAction: (action: string, vehicle: any) => void;
getCountryFlag: (country: string) => string;
getStatusColor: (status: string) => string;
getFuelStatusColor: (days: number) => string;
getDaysSinceLastFuel: (date: string) => number;
isServiceDue: (date: string) => boolean;
formatDate: (date: string) => string;
}) => {
// ... same component implementation as before
});

export default function VehiclesCardViewPage() {
const [searchQuery, setSearchQuery] = useState('');
const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
const [activeTab, setActiveTab] = useState<'horses' | 'trailers' | 'combinations'>('horses');

// Replace mock data with database queries
const { data: vehicles = [], isLoading: vehiclesLoading } = trpc.vehicles.getAll.useQuery({
search: searchQuery,
type: activeTab === 'horses' ? 'horses' : activeTab === 'trailers' ? 'trailers' : 'all',
});

const { data: combinations = [], isLoading: combinationsLoading } = trpc.vehicles.getCombinations.useQuery({
search: searchQuery,
});

const { data: stats } = trpc.vehicles.getStats.useQuery();

// Memoized filtered data (now handled by database queries)
const filteredVehicles = useMemo(() => vehicles, [vehicles]);
const filteredCombinations = useMemo(() => combinations, [combinations]);

const handleSelectVehicle = useCallback((vehicleId: string) => {
setSelectedVehicles(prev =>
prev.includes(vehicleId)
? prev.filter(id => id !== vehicleId)
: [...prev, vehicleId]
);
}, []);

const handleVehicleAction = useCallback((action: string, vehicle: any) => {
console.log(`${action} action for vehicle:`, vehicle.registration);
// TODO: Implement actual action handlers using TRPC mutations
}, []);

// Utility functions (same as before)
const formatDate = useCallback((dateString: string) => {
return new Date(dateString).toLocaleDateString('en-US', {
year: 'numeric',
month: 'short',
day: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
}, []);

const getCountryFlag = useCallback((country: string) => {
const flags: { [key: string]: string } = {
'CONGO (DRC)': '🇨🇩',
'ZIMBABWE': '🇿🇼',
'ZAMBIA': '🇿🇲',
'TANZANIA': '🇹🇿',
'UNKNOWN': '❓'
};
return flags[country] || '🌍';
}, []);

const getStatusColor = useCallback((status: string) => {
switch (status) {
case 'Active':
return 'bg-green-100 text-green-800';
case 'In Transit':
return 'bg-blue-100 text-blue-800';
case 'Maintenance':
return 'bg-red-100 text-red-800';
case 'Out of Service':
return 'bg-gray-100 text-gray-800';
default:
return 'bg-gray-100 text-gray-800';
}
}, []);

const getDaysSinceLastFuel = useCallback((lastFuelDate: string) => {
const lastFuel = new Date(lastFuelDate);
const today = new Date();
const diffTime = Math.abs(today.getTime() - lastFuel.getTime());
const diffDays = Math.ceil(diffTime / (1000 _ 60 _ 60 \* 24));
return diffDays;
}, []);

const getFuelStatusColor = useCallback((daysSinceFuel: number) => {
if (daysSinceFuel > 7) return 'text-red-500';
if (daysSinceFuel > 3) return 'text-orange-500';
return 'text-green-500';
}, []);

const isServiceDue = useCallback((nextServiceDate: string) => {
const serviceDate = new Date(nextServiceDate);
const today = new Date();
const daysUntilService = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 _ 60 _ 60 \* 24));
return daysUntilService <= 30;
}, []);

// Loading state
if (vehiclesLoading || combinationsLoading) {
return (

<div className="p-6">
<div className="flex items-center justify-center h-64">
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
<span className="ml-2 text-gray-600">Loading vehicles...</span>
</div>
</div>
);
}

return (

<div className="p-6">
{/_ Header with stats _/}
<div className="mb-8">
<div className="flex items-center space-x-3 mb-2">
<Car className="w-8 h-8 text-amber-600" />
<h1 className="text-3xl font-bold text-gray-900">Vehicles (Card View)</h1>
<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Database</span>
</div>
<p className="text-gray-600">Fleet management with real-time data from MySQL database</p>

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</div>
              <div className="text-sm text-gray-500">Total Vehicles</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.activeVehicles}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.horses}</div>
              <div className="text-sm text-gray-500">Horses</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.trailers}</div>
              <div className="text-sm text-gray-500">Trailers</div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the component remains the same */}
      {/* ... */}
    </div>

);
}
