// FILE: src/components/dashboard/DisplayDashboard.tsx
// Visual display dashboard optimized for large screens with auto-rotating information

'use client';

import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    FileText,
    Globe,
    MapPin,
    Maximize2,
    Minimize2,
    Package,
    RefreshCw,
    Settings,
    Truck,
    Wifi,
    WifiOff
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ManifestItem {
  id: string;
  title: string | null;
  status: string;
  trackingId: string | null;
  companyId: string | null;
  company?: { id: string; name: string } | null;
  route?: { id: string; name: string } | null;
  location?: { id: string; description: string | null; latitude: number | null; longitude: number | null } | null;
  parkLocation?: { id: string; description: string | null; latitude: number | null; longitude: number | null } | null;
  scheduledAt: string | null;
  dateTimeAdded: string;
  dateTimeUpdated: string | null;
  dateTimeEnded: string | null;
  createdAt: string;
  horseId: string | null;
  trailerId1: string | null;
  trailerId2: string | null;
  jobNumber?: string | null;
  rmn?: string | null;
}

interface DashboardStats {
  total: number;
  active: number;
  waiting: number;
  breakdown: number;
  accident: number;
  logistical: number;
  closed: number;
  handed_over: number;
  foreign: number;
}

interface DisplayDashboardProps {
  manifests: ManifestItem[];
  criticalManifests: ManifestItem[];
  stats: DashboardStats;
  isLoading: boolean;
  isConnected: boolean;
  lastRefresh: Date;
  autoRefresh: boolean;
  cacheRefreshInterval: number; // Minutes - how often to fetch from DB
  cacheAge: number; // How old the cache is in minutes
  nextRefreshTime: Date; // When the next refresh will happen
  isFullscreen: boolean;
  statusFilters: string[]; // Current status filters
  highPriorityOnly: boolean; // High priority filter
  maxResults: number; // Maximum results to show
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
  onSetCacheRefreshInterval: (interval: number) => void;
  onToggleFullscreen: () => void;
  onStatusFilterChange: (filters: string[]) => void;
  onHighPriorityToggle: () => void;
  onMaxResultsChange: (max: number) => void;
}

export function DisplayDashboard({
  manifests,
  criticalManifests,
  stats,
  isLoading,
  isConnected,
  lastRefresh,
  autoRefresh,
  cacheRefreshInterval,
  cacheAge,
  nextRefreshTime,
  isFullscreen,
  statusFilters,
  highPriorityOnly,
  maxResults,
  onRefresh,
  onToggleAutoRefresh,
  onSetCacheRefreshInterval,
  onToggleFullscreen,
  onStatusFilterChange,
  onHighPriorityToggle,
  onMaxResultsChange,
}: DisplayDashboardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [cardsPerScreen, setCardsPerScreen] = useState(12); // Default, will be calculated

  // Calculate optimal number of cards per screen based on viewport
  useEffect(() => {
    const calculateCardsPerScreen = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for header, stats, and footer space
      const availableHeight = viewportHeight - 200; // Approximate space for header/stats/footer
      const availableWidth = viewportWidth - 32; // Account for padding
      
      // Card dimensions (approximate)
      const cardWidth = 280; // Based on current card size
      const cardHeight = 200; // Based on current card size
      
      const cardsPerRow = Math.floor(availableWidth / cardWidth);
      const cardsPerColumn = Math.floor(availableHeight / cardHeight);
      
      const totalCards = Math.min(cardsPerRow * cardsPerColumn, 15); // Max 15 cards
      setCardsPerScreen(Math.max(totalCards, 8)); // Min 8 cards
    };

    calculateCardsPerScreen();
    window.addEventListener('resize', calculateCardsPerScreen);
    return () => window.removeEventListener('resize', calculateCardsPerScreen);
  }, []);

  // Auto-rotate manifest batches every 10 seconds
  useEffect(() => {
    if (manifests.length <= cardsPerScreen) return; // No need to rotate if all fit

    const interval = setInterval(() => {
      setCurrentBatch((prev) => {
        const totalBatches = Math.ceil(manifests.length / cardsPerScreen);
        return (prev + 1) % totalBatches;
      });
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [manifests.length, cardsPerScreen]);

  // Get current batch of manifests to display
  const getCurrentBatchManifests = () => {
    const startIndex = currentBatch * cardsPerScreen;
    const endIndex = startIndex + cardsPerScreen;
    return manifests.slice(startIndex, endIndex);
  };

  const currentManifests = getCurrentBatchManifests();
  const totalBatches = Math.ceil(manifests.length / cardsPerScreen);

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showSettings && !target.closest('.settings-panel')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    const now = typeof window !== 'undefined' ? new Date() : new Date(0);
    const dateObj = new Date(dateString);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'SCHEDULED':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (manifest: ManifestItem): number => {
    // Calculate progress based on time and status
    if (manifest.status === 'COMPLETED') return 100;
    if (manifest.status === 'CANCELLED') return 0;
    
    const start = new Date(manifest.dateTimeAdded).getTime();
    const now = typeof window !== 'undefined' ? Date.now() : 0;
    const elapsed = now - start;
    
    // Estimate: average trip is 8 hours
    const estimatedDuration = 8 * 60 * 60 * 1000;
    const progress = Math.min((elapsed / estimatedDuration) * 100, 95);
    
    return Math.round(progress);
  };

  const getStalenessColor = (manifest: ManifestItem): string => {
    const now = typeof window !== 'undefined' ? Date.now() : 0;
    const minutesSinceUpdate = manifest.dateTimeUpdated 
      ? Math.floor((now - new Date(manifest.dateTimeUpdated).getTime()) / (1000 * 60))
      : 999;

    if (minutesSinceUpdate > 120) return 'text-red-600';
    if (minutesSinceUpdate > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const toggleFullscreen = () => {
    onToggleFullscreen();
  };

  const criticalAlerts = criticalManifests;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden`}>
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Back Button */}
            <Link
              href="/dashboard/manifests"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <h1 className="text-lg font-bold">DMOC Operations Display</h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Settings */}
            <div className="relative settings-panel">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 z-50">
                  <h3 className="font-semibold text-white mb-3">Display Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Status Filters */}
                    <div>
                      <span className="text-sm text-gray-400 mb-2 block">Status Filters</span>
                      <div className="space-y-2">
                        {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                          <label key={status} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={statusFilters.includes(status)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  onStatusFilterChange([...statusFilters, status]);
                                } else {
                                  onStatusFilterChange(statusFilters.filter(s => s !== status));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-white">{status.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* High Priority Filter */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">High Priority Only</span>
                      <button
                        onClick={onHighPriorityToggle}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          highPriorityOnly 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {highPriorityOnly ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    {/* Max Results */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Max Results</span>
                      <select
                        value={maxResults}
                        onChange={(e) => onMaxResultsChange(Number(e.target.value))}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      >
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                        <option value={2000}>2000</option>
                      </select>
                    </div>
                    
                    {/* Auto Refresh */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Auto Refresh</span>
                      <button
                        onClick={onToggleAutoRefresh}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          autoRefresh 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {autoRefresh ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    {/* Cache Refresh */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cache Refresh</span>
                      <select
                        value={cacheRefreshInterval}
                        onChange={(e) => onSetCacheRefreshInterval(Number(e.target.value))}
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                        disabled={!autoRefresh}
                      >
                        <option value={10}>10min</option>
                        <option value={15}>15min</option>
                        <option value={20}>20min</option>
                        <option value={30}>30min</option>
                      </select>
                    </div>
                    
                    {/* Fullscreen */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Fullscreen</span>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="mt-1 text-xs text-gray-400">
          <span suppressHydrationWarning>Last updated: {lastRefresh.toLocaleTimeString()}</span> • 
          Auto-refresh: {autoRefresh ? 'ON' : 'OFF'} ({cacheRefreshInterval}min) •
          Cache age: {Math.round(cacheAge)}min • 
          <span suppressHydrationWarning>Next refresh: {nextRefreshTime.toLocaleTimeString()}</span> •
          Filters: {statusFilters.join(', ')} {highPriorityOnly ? '(High Priority)' : ''} •
          Showing: {currentBatch + 1}/{totalBatches} batches ({currentManifests.length} cards) •
          Total manifests: {manifests.length}
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-900 border-b-2 border-red-500 px-4 py-2 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-300" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  {criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length !== 1 ? 'S' : ''}
                </h3>
                <p className="text-xs text-red-200">
                  Immediate attention required
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {criticalAlerts.slice(0, 3).map((manifest) => (
                <div key={manifest.id} className="px-2 py-1 bg-red-800 rounded text-xs">
                  <span className="font-bold text-white">{manifest.trackingId || manifest.jobNumber || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
              <FileText className="w-4 h-4 text-blue-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-xs font-medium">Active</p>
                <p className="text-lg font-bold">{stats.active}</p>
              </div>
              <Activity className="w-4 h-4 text-green-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-xs font-medium">Waiting</p>
                <p className="text-lg font-bold">{stats.waiting}</p>
              </div>
              <Clock className="w-4 h-4 text-yellow-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-xs font-medium">Breakdown</p>
                <p className="text-lg font-bold">{stats.breakdown}</p>
              </div>
              <AlertCircle className="w-4 h-4 text-orange-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-xs font-medium">Accident</p>
                <p className="text-lg font-bold">{stats.accident}</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-red-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-xs font-medium">Logistical</p>
                <p className="text-lg font-bold">{stats.logistical}</p>
              </div>
              <Package className="w-4 h-4 text-purple-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-xs font-medium">Closed</p>
                <p className="text-lg font-bold">{stats.closed}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-gray-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Foreign</p>
                <p className="text-lg font-bold">{stats.foreign}</p>
              </div>
              <Globe className="w-4 h-4 text-indigo-300 opacity-50" />
            </div>
          </div>
        </div>

        {/* Visual Manifest Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mr-2" />
            <span className="text-sm text-gray-400">Loading manifests...</span>
          </div>
        ) : manifests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white mb-1">All Clear!</h3>
            <p className="text-sm text-gray-400">No active manifests requiring attention</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {currentManifests.map((manifest: ManifestItem) => {
              const now = typeof window !== 'undefined' ? Date.now() : 0;
              const minutesSinceUpdate = manifest.dateTimeUpdated 
                ? Math.floor((now - new Date(manifest.dateTimeUpdated).getTime()) / (1000 * 60))
                : 999;
              
              const isCritical = minutesSinceUpdate > 120;
              const progress = getProgressPercentage(manifest);

              return (
                <div
                  key={manifest.id}
                  className={`relative p-3 rounded-lg border transition-all ${
                    isCritical 
                      ? 'bg-gradient-to-br from-red-900 to-red-800 border-red-500 animate-pulse' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {/* Truck Icon with Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getStatusColor(manifest.status)}`}>
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {manifest.trackingId || manifest.jobNumber || 'Unknown'}
                        </h3>
                        <p className="text-gray-300 text-xs">
                          {manifest.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {isCritical && (
                      <AlertTriangle className="w-4 h-4 text-red-300 animate-pulse" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          progress < 30 ? 'bg-yellow-500' :
                          progress < 70 ? 'bg-blue-500' :
                          progress < 95 ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Manifest Information */}
                  <div className="space-y-1 min-h-[60px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Company</span>
                        <span className="text-white font-semibold truncate ml-2">
                          {manifest.company?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Route</span>
                        <span className="text-white font-semibold truncate ml-2">
                          {manifest.route?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Updated</span>
                        <span className={`font-bold ${getStalenessColor(manifest)}`}>
                          {formatRelativeTime(manifest.dateTimeUpdated)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Indicator */}
                  {manifest.location && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-2 text-blue-400">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-medium truncate">
                          {manifest.location.description}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 mt-8">
        <div className="text-center text-gray-400 text-sm">
          DMOC Operations Display Dashboard • Real-time monitoring • 
          Manifest batches rotate every 10 seconds • 
          Database cache refreshes every {cacheRefreshInterval} minutes
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}