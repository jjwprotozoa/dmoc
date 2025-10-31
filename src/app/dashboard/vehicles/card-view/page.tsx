// src/app/dashboard/vehicles/card-view/page.tsx
'use client';

import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Calendar,
    Car,
    Edit,
    Eye,
    Fuel,
    Gauge,
    Link,
    MapPin,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Truck,
    Unlink,
    Wrench
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { BackToTop } from '../../../../components/ui/back-to-top';
import { Button } from '../../../../components/ui/button';
import {
  VehicleFilters,
  VehicleFilterState,
} from '../../../../components/dashboard/VehicleFilters';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { Pagination } from '../../../../components/ui/pagination';

// Vehicle interface matching database schema with component compatibility
interface Vehicle {
  id: string; // Database cuid
  vehicleId: number; // Legacy ID
  vehicleTypeId?: number | null;
  entityTypeDescription: string;
  registration: string;
  color?: string | null;
  countryOfOrigin: string;
  createdAt: Date | string; // Database field
  displayValue: string;
  // Additional fields from database
  mileage?: number | null;
  lastServiceDate?: Date | string | null;
  nextServiceDue?: Date | string | null;
  status?: string;
  currentDriver?: string | null;
  location?: string | null;
  lastSeen?: string | null;
  // Computed/compatibility fields
  dateTimeAdded?: string; // Format createdAt for display
  lastFuelEntry?: {
    date: string;
    amount: number;
    cost: number;
    driver: string;
    odometerReading: number;
  };
}

// VehicleCombination interface matching database schema
interface VehicleCombination {
  id: string;
  horse: Vehicle;
  trailers: Vehicle[]; // From trailers relation
  driver: string;
  status: string;
  startDate: Date | string;
  cargo?: string | null;
  route?: string | null;
}

// Helper function to format vehicle from database
const formatVehicleFromDb = (vehicle: any): Vehicle => {
  return {
    ...vehicle,
    dateTimeAdded: vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString('en-US', { hour12: true }) : '',
    lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toISOString() : undefined,
    nextServiceDue: vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toISOString() : undefined,
  };
};

// Helper function to format combination from database
const formatCombinationFromDb = (combo: any): VehicleCombination => {
  return {
    id: combo.id,
    horse: formatVehicleFromDb(combo.horse),
    trailers: combo.trailers?.map((t: any) => formatVehicleFromDb(t.trailer || t)) || [],
    driver: combo.driver,
    status: combo.status,
    startDate: combo.startDate ? new Date(combo.startDate).toISOString() : '',
    cargo: combo.cargo,
    route: combo.route,
  };
};

export default function VehiclesCardViewPage() {
  const [filters, setFilters] = useState<VehicleFilterState>({
    status: [],
    type: 'all',
    dateRange: 'all',
    searchQuery: '',
    quickFilter: 'all',
  });
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'horses' | 'trailers' | 'combinations'>('horses');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [showLogbookDialog, setShowLogbookDialog] = useState(false);
  const [logbookVehicle, setLogbookVehicle] = useState<Vehicle | null>(null);
  const [showFuelEntryDialog, setShowFuelEntryDialog] = useState(false);
  const [fuelEntryVehicle, setFuelEntryVehicle] = useState<Vehicle | null>(null);

  // Get filter counts
  const { data: filterCounts } = trpc.vehicles.getFilterCounts.useQuery();

  // Determine type based on activeTab or quickFilter
  const vehicleType = useMemo(() => {
    if (activeTab === 'horses') return 'horses';
    if (activeTab === 'trailers') return 'trailers';
    if (filters.quickFilter === 'horses') return 'horses';
    if (filters.quickFilter === 'trailers') return 'trailers';
    return filters.type;
  }, [activeTab, filters.quickFilter, filters.type]);

  // Map quickFilter to status/type
  const mapQuickFilterToQuery = () => {
    const query: any = {
      q: filters.searchQuery || undefined,
      type: vehicleType !== 'all' ? vehicleType : undefined,
      status: filters.status.length > 0 ? filters.status : undefined,
      dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
      customDateFrom: filters.customDateFrom,
      customDateTo: filters.customDateTo,
      take: 50,
      skip: 0,
    };

    // Map quick filter to status/type
    switch (filters.quickFilter) {
      case 'active':
        query.status = ['Active'];
        break;
      case 'horses':
        query.type = 'horses';
        break;
      case 'trailers':
        query.type = 'trailers';
        break;
      case 'maintenance':
        query.status = ['Maintenance'];
        break;
      case 'inTransit':
        query.status = ['In Transit'];
        break;
      case 'outOfService':
        query.status = ['Out of Service'];
        break;
      default:
        // 'all' - show all vehicles regardless of status
        break;
    }

    return query;
  };

  // Fetch vehicles from tRPC using list endpoint
  const { data: vehiclesListData, isLoading: vehiclesLoading, error: vehiclesError, refetch } = trpc.vehicles.list.useQuery(
    mapQuickFilterToQuery()
  );

  // Fetch combinations from tRPC
  const { data: combinationsData, isLoading: combinationsLoading, error: combinationsError } = trpc.vehicleCombinations.getAll.useQuery({});

  // Format vehicles from database
  const vehicles = useMemo(() => {
    if (!vehiclesListData?.items) {
      console.log('🔍 [Vehicles Page] No vehiclesData yet');
      return [];
    }
    console.log('🔍 [Vehicles Page] Vehicles data received:', vehiclesListData.items.length, 'vehicles');
    if (vehiclesListData.items.length === 0) {
      console.warn('⚠️ [Vehicles Page] Received empty vehicles array');
    }
    return vehiclesListData.items.map(formatVehicleFromDb);
  }, [vehiclesListData]);

  // Format combinations from database
  const combinations = useMemo(() => {
    if (!combinationsData) return [];
    console.log('🔍 Combinations data received:', combinationsData.length, 'combinations');
    return combinationsData.map(formatCombinationFromDb);
  }, [combinationsData]);

  // Filter vehicles client-side by tab (server-side filtering handles the rest)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Filter by tab if not already filtered by quickFilter
      if (activeTab === 'horses' && filters.quickFilter !== 'horses') {
        return vehicle.entityTypeDescription === 'HORSE';
      }
      if (activeTab === 'trailers' && filters.quickFilter !== 'trailers') {
        return vehicle.entityTypeDescription === 'TRAILER';
      }
      return true;
    });
  }, [vehicles, activeTab, filters.quickFilter]);

  // Filter combinations client-side
  const filteredCombinations = useMemo(() => {
    return combinations.filter(combo => {
      if (activeTab !== 'combinations') return false;
      
      if (!filters.searchQuery) return true;
      
      const searchLower = filters.searchQuery.toLowerCase();
      return combo.horse.registration.toLowerCase().includes(searchLower) ||
        combo.driver.toLowerCase().includes(searchLower) ||
        combo.cargo?.toLowerCase().includes(searchLower) ||
        combo.route?.toLowerCase().includes(searchLower) ||
        combo.trailers.some(trailer => trailer.registration.toLowerCase().includes(searchLower));
    });
  }, [combinations, filters.searchQuery, activeTab]);

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };


  const handleVehicleAction = (action: string, vehicle: Vehicle) => {
    console.log(`${action} action for vehicle:`, vehicle.registration);
    // TODO: Implement actual action handlers
    switch (action) {
      case 'add':
        // Open add vehicle dialog
        break;
      case 'edit':
        // Open edit vehicle dialog
        break;
      case 'view-logbook':
        setLogbookVehicle(vehicle);
        setShowLogbookDialog(true);
        break;
      case 'add-fuel-entry':
        setFuelEntryVehicle(vehicle);
        setShowFuelEntryDialog(true);
        break;
      case 'schedule-service':
        // Open service scheduling dialog
        break;
      case 'track':
        // Open tracking interface
        break;
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'CONGO (DRC)': '🇨🇩',
      'ZIMBABWE': '🇿🇼',
      'ZAMBIA': '🇿🇲',
      'TANZANIA': '🇹🇿',
      'UNKNOWN': '❓'
    };
    return flags[country] || '🌍';
  };

  const getStatusColor = (status: string) => {
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
  };

  const getDaysSinceLastFuel = (lastFuelDate: string | Date | null | undefined) => {
    if (!lastFuelDate) return 999; // No fuel entry
    const lastFuel = typeof lastFuelDate === 'string' ? new Date(lastFuelDate) : lastFuelDate;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastFuel.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFuelStatusColor = (daysSinceFuel: number) => {
    if (daysSinceFuel > 7) return 'text-red-500';
    if (daysSinceFuel > 3) return 'text-orange-500';
    return 'text-green-500';
  };

  const isServiceDue = (nextServiceDate: string | Date | null | undefined) => {
    if (!nextServiceDate) return false;
    const serviceDate = typeof nextServiceDate === 'string' ? new Date(nextServiceDate) : nextServiceDate;
    const today = new Date();
    const daysUntilService = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilService <= 30; // Service due within 30 days
  };

  // Show loading state
  if (vehiclesLoading || combinationsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (vehiclesError || combinationsError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading vehicles</p>
            <p className="text-sm text-gray-500">
              {vehiclesError?.message || combinationsError?.message || 'Unknown error'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="page-header">
          <div className="page-header-title">
            <Car className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
              <p className="text-gray-600">Card view • Fleet management and logbook</p>
            </div>
          </div>
          <div className="page-header-actions">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Card view</span>
            <a 
              href="/dashboard/vehicles" 
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Table
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('horses');
                setPage(1); // Reset to first page when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'horses'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Horses ({vehicles.filter(v => v.entityTypeDescription === 'HORSE').length})</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('trailers');
                setPage(1); // Reset to first page when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trailers'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4" />
                <span>Trailers ({vehicles.filter(v => v.entityTypeDescription === 'TRAILER').length})</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('combinations');
                setPage(1); // Reset to first page when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'combinations'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>Combinations ({combinations.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Quick search vehicles by registration, driver, location..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Modern Filter Component */}
      <VehicleFilters
        filters={filters}
        counts={
          filterCounts || {
            all: 0,
            active: 0,
            horses: 0,
            trailers: 0,
            maintenance: 0,
            inTransit: 0,
            outOfService: 0,
            total: 0,
          }
        }
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1); // Reset to first page when filters change
        }}
        onRefresh={() => refetch()}
        isLoading={vehiclesLoading}
      />

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            {activeTab === 'combinations' ? (
              <>
                Showing {filteredCombinations.length} of {combinations.length} combinations
                {selectedVehicles.length > 0 && (
                  <span className="ml-2 text-amber-600">
                    • {selectedVehicles.length} selected
                  </span>
                )}
              </>
            ) : (
              <>
                Showing {filteredVehicles.length} of {vehiclesListData?.total || vehicles.length} vehicles
                {selectedVehicles.length > 0 && (
                  <span className="ml-2 text-amber-600">
                    • {selectedVehicles.length} selected
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleVehicleAction('add', {} as Vehicle)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'combinations' ? (
        /* Combinations Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCombinations.map((combo) => (
            <div 
              key={combo.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Link className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {combo.horse.registration}
                    </h3>
                    <p className="text-sm text-gray-500">+ {combo.trailers.length} trailer(s)</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(combo.status)}`}>
                  {combo.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Driver:</span>
                  <span className="text-gray-900 font-medium">{combo.driver}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cargo:</span>
                  <span className="text-gray-900">{combo.cargo || 'General'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Route:</span>
                  <span className="text-gray-900">{combo.route || 'TBD'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Started:</span>
                  <span className="text-gray-900">{formatDate(combo.startDate)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Trailers:</h4>
                  <div className="space-y-1">
                    {combo.trailers.map((trailer) => (
                      <div key={trailer.id} className="flex items-center space-x-2 text-sm">
                        <Car className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-900">{trailer.registration}</span>
                        <span className="text-gray-500">({trailer.countryOfOrigin})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Unlink className="w-3 h-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
        {/* Vehicles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredVehicles.slice((page - 1) * pageSize, page * pageSize).map((vehicle) => (
          <div 
            key={vehicle.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
              selectedVehicles.includes(vehicle.id) ? 'ring-2 ring-amber-500 bg-amber-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes(vehicle.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectVehicle(vehicle.id);
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(vehicle.countryOfOrigin)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {vehicle.registration}
                    </h3>
                    <p className="text-xs text-gray-500">{vehicle.entityTypeDescription}</p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Vehicle Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleVehicleAction('edit', vehicle)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Vehicle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleVehicleAction('view-logbook', vehicle)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Logbook
                  </DropdownMenuItem>
                  {vehicle.entityTypeDescription === 'HORSE' && (
                    <DropdownMenuItem onClick={() => handleVehicleAction('add-fuel-entry', vehicle)}>
                      <Fuel className="mr-2 h-4 w-4" />
                      Add Fuel Entry
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleVehicleAction('schedule-service', vehicle)}>
                    <Wrench className="mr-2 h-4 w-4" />
                    Schedule Service
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleVehicleAction('track', vehicle)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Track Vehicle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              {/* Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status || 'Active')}`}>
                  {vehicle.status || 'Active'}
                </span>
              </div>

              {/* Last Fuel Entry */}
              {vehicle.entityTypeDescription === 'HORSE' && vehicle.lastFuelEntry && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last Refuel:</span>
                  <div className="flex items-center space-x-1">
                    <Fuel className={`w-3 h-3 ${getFuelStatusColor(getDaysSinceLastFuel(vehicle.lastFuelEntry.date))}`} />
                    <span className={`font-medium ${getFuelStatusColor(getDaysSinceLastFuel(vehicle.lastFuelEntry.date))}`}>
                      {getDaysSinceLastFuel(vehicle.lastFuelEntry.date)}d ago
                    </span>
                  </div>
                </div>
              )}

              {/* Mileage */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Mileage:</span>
                <span className="text-gray-900 font-mono">
                  {(vehicle.mileage || 0).toLocaleString()} km
                </span>
              </div>

              {/* Current Driver */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Driver:</span>
                <span className="text-gray-900 truncate max-w-24">
                  {vehicle.currentDriver || 'Unassigned'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Location:</span>
                <span className="text-gray-900 truncate max-w-24">
                  {vehicle.location || 'Unknown'}
                </span>
              </div>

              {/* Service Due Warning */}
              {vehicle.nextServiceDue && isServiceDue(vehicle.nextServiceDue) && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-500">Service Due:</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-red-500 font-medium">
                      {new Date(vehicle.nextServiceDue).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Added {formatDate(vehicle.dateTimeAdded)}
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{getCountryFlag(vehicle.countryOfOrigin)}</span>
                        <span>{vehicle.registration}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status || 'Active')}`}>
                          {vehicle.status || 'Active'}
                        </span>
                      </DialogTitle>
                      <DialogDescription>
                        Complete vehicle information and maintenance details
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Vehicle Photo Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Vehicle Photo</h3>
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            {vehicle.entityTypeDescription === 'HORSE' ? (
                              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            ) : (
                              <Car className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            )}
                            <p className="text-sm text-gray-600">Photo Available</p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Vehicle Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Registration</label>
                            <p className="text-gray-900">{vehicle.registration}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Vehicle Type</label>
                            <p className="text-gray-900">{vehicle.entityTypeDescription}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Country of Origin</label>
                            <p className="text-gray-900">{vehicle.countryOfOrigin}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Current Driver</label>
                            <p className="text-gray-900">{vehicle.currentDriver || 'Unassigned'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900">{vehicle.location || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Seen</label>
                            <p className="text-gray-900">{vehicle.lastSeen || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Date Added</label>
                            <p className="text-gray-900">{formatDate(vehicle.dateTimeAdded)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Vehicle ID</label>
                            <p className="text-gray-900 font-mono text-sm">{vehicle.vehicleId}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance and Performance Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Maintenance & Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Fuel className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Last Refuel</span>
                          </div>
                          {vehicle.entityTypeDescription === 'HORSE' && vehicle.lastFuelEntry ? (
                            <>
                              <p className="text-lg font-bold text-gray-900">
                                {vehicle.lastFuelEntry.amount}L
                              </p>
                              <p className="text-xs text-gray-500">
                                {getDaysSinceLastFuel(vehicle.lastFuelEntry.date)} days ago
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">N/A for trailers</p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Gauge className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Mileage</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {(vehicle.mileage || 0).toLocaleString()} km
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">Next Service</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toLocaleDateString() : 'Not scheduled'}
                          </p>
                          {vehicle.nextServiceDue && isServiceDue(vehicle.nextServiceDue) && (
                            <p className="text-xs text-red-500">Service due soon!</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        onClick={() => handleVehicleAction('edit', vehicle)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Vehicle
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleVehicleAction('view-logbook', vehicle)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Logbook
                      </Button>
                      <Button 
                        onClick={() => handleVehicleAction('track', vehicle)}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Vehicle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
        </div>
        <Pagination page={page} pageSize={pageSize} total={filteredVehicles.length} onPageChange={setPage} />
        </>
      )}

      {/* Empty State */}
      {(activeTab === 'combinations' ? filteredCombinations.length === 0 : filteredVehicles.length === 0) && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'combinations' ? (
            <>
              <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No combinations found</h3>
              <p className="text-gray-500">
                {filters.searchQuery ? 'Try adjusting your search criteria' : 'No horse-trailer combinations are currently active'}
              </p>
            </>
          ) : (
            <>
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-gray-500 mb-4">
                {filters.searchQuery ? 'Try adjusting your search criteria' : vehicles.length === 0 ? 'No vehicles have been imported yet. Run the seed script to import vehicles.' : `No ${activeTab} match your current filter`}
              </p>
              {vehicles.length === 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">To import vehicles:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">npm run db:seed</code>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Feature Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Fuel className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fuel Monitoring</h3>
          <p className="text-gray-600 mb-4">Track fuel consumption and optimize efficiency</p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Fuel Reports →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Logbook</h3>
          <p className="text-gray-600 mb-4">Comprehensive maintenance and service history</p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            Open Logbook →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Activity className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analytics</h3>
          <p className="text-gray-600 mb-4">Monitor vehicle performance and efficiency metrics</p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Analytics →
          </button>
        </div>
      </div>

      {/* Vehicle Logbook Dialog */}
      {logbookVehicle && (
        <Dialog open={showLogbookDialog} onOpenChange={setShowLogbookDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-amber-600" />
                <span>Vehicle Logbook - {logbookVehicle.registration}</span>
              </DialogTitle>
              <DialogDescription>
                Complete maintenance history and fuel consumption tracking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Logbook Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Fuel Used</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">2,450 L</p>
                  <p className="text-xs text-blue-600">This month</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Gauge className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Average Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">8.2 km/L</p>
                  <p className="text-xs text-green-600">Last 30 days</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wrench className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Services Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">12</p>
                  <p className="text-xs text-orange-600">This year</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Days Since Service</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">45</p>
                  <p className="text-xs text-purple-600">Last service</p>
                </div>
              </div>

              {/* Recent Entries */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Logbook Entries</h3>
                <div className="space-y-3">
                  {[
                    { date: '2024-03-15', type: 'Fuel Fill', amount: '85L', cost: 'R1,275', driver: 'John Doe' },
                    { date: '2024-03-10', type: 'Maintenance', amount: 'Oil Change', cost: 'R450', driver: 'Service Center' },
                    { date: '2024-03-08', type: 'Fuel Fill', amount: '92L', cost: 'R1,380', driver: 'Jane Smith' },
                    { date: '2024-03-05', type: 'Inspection', amount: 'Annual', cost: 'R300', driver: 'Inspector' },
                    { date: '2024-03-01', type: 'Fuel Fill', amount: '78L', cost: 'R1,170', driver: 'Mike Johnson' }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">{entry.date}</span>
                        <span className="text-sm text-gray-600">{entry.type}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{entry.amount}</span>
                        <span className="font-medium">{entry.cost}</span>
                        <span>{entry.driver}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowLogbookDialog(false)}>
                Close
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Fuel Entry Dialog */}
      {fuelEntryVehicle && (
        <Dialog open={showFuelEntryDialog} onOpenChange={setShowFuelEntryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Fuel className="w-6 h-6 text-amber-600" />
                <span>Add Fuel Entry - {fuelEntryVehicle.registration}</span>
              </DialogTitle>
              <DialogDescription>
                Record a new fuel refill for this vehicle
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Amount (L)</label>
                  <input
                    type="number"
                    placeholder="85"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (R)</label>
                  <input
                    type="number"
                    placeholder="1275"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading (km)</label>
                <input
                  type="number"
                  placeholder="125000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Johannesburg, SA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowFuelEntryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log('Fuel entry added for', fuelEntryVehicle.registration);
                setShowFuelEntryDialog(false);
              }}>
                <Fuel className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <BackToTop />
    </div>
  );
}
