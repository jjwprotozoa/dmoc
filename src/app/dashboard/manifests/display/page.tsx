// FILE: src/app/dashboard/manifests/display/page.tsx
// Display screen dashboard for high priority manifest notifications and overview

'use client';

// Icons are now handled by the DisplayDashboard component
import { useEffect, useState } from 'react';
import { DisplayDashboard } from '../../../../components/dashboard/DisplayDashboard';
import { useSocket } from '../../../../hooks/useSocket';
import { trpc } from '../../../../lib/trpc';

interface ManifestItem {
  id: string;
  title: string | null;
  status: string;
  trackingId: string | null;
  companyId: string | null;
  company?: { id: string; name: string } | null;
  route?: { id: string; name: string } | null;
  location?: { id: string; description: string; latitude: number | null; longitude: number | null } | null;
  parkLocation?: { id: string; description: string; latitude: number | null; longitude: number | null } | null;
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

// Type for API response manifest items (without optional fields)
type ApiManifestItem = Omit<ManifestItem, 'jobNumber' | 'rmn'>;

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

export default function ManifestDisplayDashboard() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [cacheRefreshInterval, setCacheRefreshInterval] = useState(15); // Minutes - how often to fetch from DB
  const [isFullscreen, setIsFullscreen] = useState(false);
interface DashboardData {
  criticalManifests: ApiManifestItem[];
  highPriorityManifests: ApiManifestItem[];
  stats: DashboardStats;
  lastUpdated: string;
  filters: {
    statusFilters: string[];
    highPriorityOnly: boolean;
    maxResults: number;
  };
}

  const [cachedData, setCachedData] = useState<DashboardData | null>(null);
  const [cacheAge, setCacheAge] = useState(0); // Track how old the cache is in minutes
  const [nextRefreshTime, setNextRefreshTime] = useState<Date>(new Date());
  
  // Dashboard configuration state
  const [statusFilters, setStatusFilters] = useState<string[]>(['IN_PROGRESS', 'SCHEDULED']);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [maxResults, setMaxResults] = useState(1000);

  // Socket connection for real-time updates
  const { socket, isConnected } = useSocket();

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Get display dashboard data (optimized for display screens)
  const { data: dashboardData, isLoading: isLoadingDashboard, refetch: refetchDashboard } = trpc.manifest.getDisplayDashboard.useQuery(
    {
      statusFilters,
      highPriorityOnly,
      maxResults,
    },
    {
      // Use stale-while-revalidate pattern with longer cache times
      staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
      cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: true, // Refetch when reconnecting
    }
  );

  // Update cached data when new data arrives
  useEffect(() => {
    if (dashboardData) {
      const refreshTime = new Date();
      setCachedData(dashboardData);
      setCacheAge(0);
      setLastRefresh(refreshTime);
      setNextRefreshTime(new Date(Date.now() + cacheRefreshInterval * 60 * 1000));
    }
  }, [dashboardData, cacheRefreshInterval]);

  // Track cache age in minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheAge(prev => prev + 1/60); // Increment by 1 second = 1/60 minute
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Long-interval cache refresh - fetch from DB every 15-20 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only refetch if cache is older than the refresh interval
      if (cacheAge >= cacheRefreshInterval) {
        console.log('🔄 [Display Dashboard] Refreshing cache from database (age:', Math.round(cacheAge), 'min)');
        refetchDashboard();
        setCacheAge(0);
      } else {
        console.log('⏭️ [Display Dashboard] Cache is fresh (age:', Math.round(cacheAge), 'min)');
      }
    }, cacheRefreshInterval * 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRefresh, cacheRefreshInterval, refetchDashboard, cacheAge]);

  // Socket event listeners for real-time updates (less aggressive)
  useEffect(() => {
    if (!socket) return;

    const handleManifestUpdate = (data: { manifestId: string; status: string; timestamp: string }) => {
      console.log('📡 [Display Dashboard] Manifest update received:', data);
      // Only refresh if cache is getting stale (older than 5 minutes)
      // This prevents excessive refreshes while still keeping data reasonably fresh
      if (cacheAge > 5) {
        console.log('🔄 [Display Dashboard] Socket update triggered refresh (cache age:', Math.round(cacheAge), 'min)');
        refetchDashboard();
        setCacheAge(0);
      } else {
        console.log('⏭️ [Display Dashboard] Socket update ignored - cache is fresh (age:', Math.round(cacheAge), 'min)');
      }
    };

    socket.on('manifest:updated', handleManifestUpdate);
    socket.on('manifest:created', handleManifestUpdate);
    socket.on('manifest:status_changed', handleManifestUpdate);

    return () => {
      socket.off('manifest:updated', handleManifestUpdate);
      socket.off('manifest:created', handleManifestUpdate);
      socket.off('manifest:status_changed', handleManifestUpdate);
    };
  }, [socket, refetchDashboard, cacheAge]);

  // Use cached data if available, fallback to fresh data
  const currentData = cachedData || dashboardData;
  const manifests = (currentData?.highPriorityManifests || []) as ManifestItem[];
  const criticalManifests = (currentData?.criticalManifests || []) as ManifestItem[];
  const stats: DashboardStats = currentData?.stats || {
    total: 0,
    active: 0,
    waiting: 0,
    breakdown: 0,
    accident: 0,
    logistical: 0,
    closed: 0,
    handed_over: 0,
    foreign: 0,
  };

  const handleRefresh = () => {
    refetchDashboard();
    setLastRefresh(new Date());
    setCacheAge(0);
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleSetCacheRefreshInterval = (interval: number) => {
    setCacheRefreshInterval(interval);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Filter handlers
  const handleStatusFilterChange = (filters: string[]) => {
    setStatusFilters(filters);
  };

  const handleHighPriorityToggle = () => {
    setHighPriorityOnly(!highPriorityOnly);
  };

  const handleMaxResultsChange = (max: number) => {
    setMaxResults(max);
  };

  return (
    <DisplayDashboard
      manifests={manifests}
      criticalManifests={criticalManifests}
      stats={stats}
      isLoading={isLoadingDashboard}
      isConnected={isConnected}
      lastRefresh={lastRefresh}
      autoRefresh={autoRefresh}
      cacheRefreshInterval={cacheRefreshInterval}
      cacheAge={cacheAge}
      nextRefreshTime={nextRefreshTime}
      isFullscreen={isFullscreen}
      statusFilters={statusFilters}
      highPriorityOnly={highPriorityOnly}
      maxResults={maxResults}
      onRefresh={handleRefresh}
      onToggleAutoRefresh={handleToggleAutoRefresh}
      onSetCacheRefreshInterval={handleSetCacheRefreshInterval}
      onToggleFullscreen={handleToggleFullscreen}
      onStatusFilterChange={handleStatusFilterChange}
      onHighPriorityToggle={handleHighPriorityToggle}
      onMaxResultsChange={handleMaxResultsChange}
    />
  );
}
