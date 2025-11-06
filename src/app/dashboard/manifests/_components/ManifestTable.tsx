// FILE: src/app/dashboard/manifests/_components/ManifestTable.tsx
// Shared manifest table component with staleness badges and filters

'use client';

import {
  FilterState,
  ManifestFilters,
} from '@/components/dashboard/ManifestFilters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ManifestTableProps {
  activeOnly?: boolean;
  title?: string;
}

// Removed unused ManifestItem interface

/**
 * Calculate staleness badge color based on minutes since last update
 */
function getStalenessBadge(minutesSinceUpdate: number) {
  if (minutesSinceUpdate < 30) {
    return { color: 'bg-green-100 text-green-800', label: 'Fresh' };
  } else if (minutesSinceUpdate < 120) {
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Stale' };
  } else {
    return { color: 'bg-red-100 text-red-800', label: 'Old' };
  }
}

/**
 * Format date to relative time
 */
function formatRelativeTime(date: string | null): string {
  if (!date) return 'N/A';

  const now = new Date();
  const dateObj = new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid date';

  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return 'Just now';
  }
}

export function ManifestTable({
  activeOnly = false,
  title,
}: ManifestTableProps) {
  console.log('🔍 [Client] ManifestTable component mounted with props:', {
    activeOnly,
    title,
  });

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: 'all',
    staleness: 'all',
    searchQuery: '',
    quickFilter: 'all',
  });
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  // Get filter counts
  const { data: filterCounts } = trpc.manifest.getFilterCounts.useQuery();

  const { data, isLoading, error, refetch } = trpc.manifest.list.useQuery(
    {
      q: filters.searchQuery || undefined,
      status: filters.status.length > 0 ? filters.status : undefined,
      activeOnly,
      dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
      customDateFrom: filters.customDateFrom,
      customDateTo: filters.customDateTo,
      staleness: filters.staleness !== 'all' ? filters.staleness : undefined,
      quickFilter:
        filters.quickFilter !== 'all' ? filters.quickFilter : undefined,
      take: pageSize,
      skip: page * pageSize,
    },
    {
      onSuccess: (data) => {
        console.log('🎉 [Client] Manifest query successful:', {
          itemsCount: data?.items?.length || 0,
          total: data?.total || 0,
          hasMore: data?.hasMore || false,
        });

        // Log sample manifest data to debug date fields
        if (data?.items && data.items.length > 0) {
          const sampleManifest = data.items[0];
          console.log('🔍 [Client] Sample manifest data:', {
            id: sampleManifest.id,
            dateTimeUpdated: sampleManifest.dateTimeUpdated,
            dateTimeUpdatedType: typeof sampleManifest.dateTimeUpdated,
            scheduledAt: sampleManifest.scheduledAt,
            scheduledAtType: typeof sampleManifest.scheduledAt,
          });
        }
      },
      onError: (error) => {
        console.error('❌ [Client] Manifest query error:', error);
      },
    }
  );

  const manifests = data?.items || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

  // Refs for synchronized scrolling
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const topScrollContentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const isScrollingRef = useRef(false);

  // Sync scrollbar widths and positions
  useEffect(() => {
    const topScroll = topScrollRef.current;
    const bottomScroll = bottomScrollRef.current;
    const topScrollContent = topScrollContentRef.current;
    const table = tableRef.current;

    if (!topScroll || !bottomScroll || !topScrollContent || !table) return;

    // Sync the scrollable width of top scrollbar with table
    const syncWidths = () => {
      const tableWidth = table.scrollWidth;
      topScrollContent.style.width = `${tableWidth}px`;
    };

    // Initial sync
    syncWidths();

    // Sync on resize
    const resizeObserver = new ResizeObserver(() => {
      syncWidths();
    });
    resizeObserver.observe(table);

    // Synchronize scroll positions
    const handleTopScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        bottomScroll.scrollLeft = topScroll.scrollLeft;
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      }
    };

    const handleBottomScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        topScroll.scrollLeft = bottomScroll.scrollLeft;
        requestAnimationFrame(() => {
          isScrollingRef.current = false;
        });
      }
    };

    topScroll.addEventListener('scroll', handleTopScroll, { passive: true });
    bottomScroll.addEventListener('scroll', handleBottomScroll, {
      passive: true,
    });

    return () => {
      resizeObserver.disconnect();
      topScroll.removeEventListener('scroll', handleTopScroll);
      bottomScroll.removeEventListener('scroll', handleBottomScroll);
    };
  }, [manifests.length]); // Re-sync when table content changes

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Error loading manifests: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Modern Filter Component */}
      <ManifestFilters
        filters={filters}
        counts={
          filterCounts || {
            all: 0,
            active: 0,
            waiting: 0,
            breakdown: 0,
            accident: 0,
            logistical: 0,
            closed: 0,
            handed_over: 0,
            foreign: 0,
            total: 0,
          }
        }
        onFiltersChange={handleFiltersChange}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* Manifest Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {title || (activeOnly ? 'Active Manifests' : 'All Manifests')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
              <p>Loading manifests...</p>
            </div>
          ) : (
            <>
              {/* Pagination Above Table */}
              {total > pageSize && (
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {manifests.length} of {total} manifests
                    {activeOnly && ' (active only)'} • Page {page + 1} of{' '}
                    {Math.ceil(total / pageSize)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Results Summary (when no pagination) */}
              {total <= pageSize && (
                <div className="mb-4 text-sm text-gray-600">
                  Showing {manifests.length} of {total} manifests
                  {activeOnly && ' (active only)'}
                </div>
              )}

              {/* Table with enhanced scroll indicators */}
              <div>
                {/* Top scrollbar - sticky and synchronized with bottom scrollbar */}
                {/* TODO: Sticky header feature - Attempted to make table header stick to viewport top when Card scrolls up.
                     Issue: overflow-x-auto container creates a containing block that prevents sticky from working relative to viewport.
                     Possible solutions for future:
                     1. Use JavaScript to detect scroll and manually position header
                     2. Restructure to separate horizontal scroll container from table structure
                     3. Use CSS position: fixed with calculated offsets
                     4. Consider using a table library that handles this (e.g., react-table with sticky headers) */}
                <div
                  ref={topScrollRef}
                  className="sticky top-16 z-20 overflow-x-auto overflow-y-hidden bg-gray-50 border-b-2 border-gray-300 mb-1"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6b7280 #e5e7eb',
                    height: '12px', // Visible scrollbar height
                    maxHeight: '12px',
                  }}
                >
                  <div ref={topScrollContentRef} style={{ height: '1px' }} />
                </div>

                {/* Main table with bottom scrollbar */}
                <div
                  ref={bottomScrollRef}
                  className="overflow-x-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#9ca3af #e5e7eb',
                  }}
                >
                  <table
                    ref={tableRef}
                    className="w-full border-collapse min-w-[1200px]"
                  >
                    <thead className="bg-white shadow-sm">
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium bg-white">
                          ID
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Title
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Status
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Company
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Route
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Tracking ID
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Job Number
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          RMN
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Scheduled
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Updated
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Staleness
                        </th>
                        <th className="text-left p-2 font-medium bg-white">
                          Invoice State
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {manifests.map((manifest) => {
                        const minutesSinceUpdate = manifest.dateTimeUpdated
                          ? Math.floor(
                              (Date.now() -
                                new Date(manifest.dateTimeUpdated).getTime()) /
                                (1000 * 60)
                            )
                          : 999;

                        const staleness = getStalenessBadge(minutesSinceUpdate);

                        return (
                          <tr
                            key={manifest.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2 font-mono text-sm">
                              {manifest.id.slice(-8)}
                            </td>
                            <td className="p-2">{manifest.title || 'N/A'}</td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  manifest.status === 'COMPLETED'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {manifest.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {manifest.company?.name || 'N/A'}
                            </td>
                            <td className="p-2">
                              {manifest.route?.name || 'N/A'}
                            </td>
                            <td className="p-2 font-mono text-sm">
                              {manifest.trackingId || 'N/A'}
                            </td>
                            <td className="p-2">
                              {manifest.jobNumber || 'N/A'}
                            </td>
                            <td className="p-2">{manifest.rmn || 'N/A'}</td>
                            <td className="p-2 text-sm">
                              {formatRelativeTime(manifest.scheduledAt)}
                            </td>
                            <td className="p-2 text-sm">
                              {formatRelativeTime(manifest.dateTimeUpdated)}
                            </td>
                            <td className="p-2">
                              <Badge className={staleness.color}>
                                {staleness.label}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {manifest.invoiceState?.name || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Scroll hint text */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="inline-flex items-center gap-1">
                    <span>←</span> Use the scrollbar above or below to see all
                    columns
                    <span>→</span>
                  </span>
                </div>
              </div>

              {/* Pagination Below Table (duplicate for convenience) */}
              {total > pageSize && (
                <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600">
                    Page {page + 1} of {Math.ceil(total / pageSize)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {manifests.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="mx-auto h-8 w-8 mb-4" />
                  <p>No manifests found</p>
                  {filters.searchQuery && (
                    <p className="text-sm mt-2">
                      Try adjusting your search criteria
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
