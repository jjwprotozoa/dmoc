// FILE: src/components/dashboard/ManifestFilters.tsx
// Modern manifest filters component inspired by Windows app design

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronDown, Filter, RefreshCw, Search, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  // Status filters
  status: string[];
  // Date filters
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all';
  customDateFrom?: string;
  customDateTo?: string;
  // Staleness filters
  staleness: 'fresh' | 'stale' | 'old' | 'all';
  // Search
  searchQuery: string;
  // Quick filters
  quickFilter: 'all' | 'active' | 'waiting' | 'breakdown' | 'accident' | 'logistical' | 'closed' | 'handed_over' | 'foreign';
}

export interface FilterCounts {
  all: number;
  active: number;
  waiting: number;
  breakdown: number;
  accident: number;
  logistical: number;
  closed: number;
  handed_over: number;
  foreign: number;
  total: number;
}

interface ManifestFiltersProps {
  filters: FilterState;
  counts: FilterCounts;
  onFiltersChange: (filters: FilterState) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const QUICK_FILTERS = [
  { value: 'all', label: 'All for Today', color: 'text-red-600', icon: '📋' },
  { value: 'active', label: 'Active', color: 'text-green-600', icon: '✅' },
  { value: 'waiting', label: 'Waiting for Docs', color: 'text-cyan-600', icon: '📄' },
  { value: 'breakdown', label: 'Breakdown', color: 'text-green-600', icon: '🔧' },
  { value: 'accident', label: 'Accident', color: 'text-orange-600', icon: '⚠️' },
  { value: 'logistical', label: 'Logistical Issues', color: 'text-purple-600', icon: '📦' },
  { value: 'closed', label: 'Closed', color: 'text-gray-600', icon: '🔒' },
  { value: 'handed_over', label: 'Handed Over', color: 'text-red-600', icon: '🤝' },
  { value: 'foreign', label: 'Foreign Horse and Driver', color: 'text-blue-600', icon: '🌍' },
];

export function ManifestFilters({ 
  filters, 
  counts, 
  onFiltersChange, 
  onRefresh, 
  isLoading = false 
}: ManifestFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string | string[] | number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    handleFilterChange('status', newStatus);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      dateRange: 'all',
      staleness: 'all',
      searchQuery: '',
      quickFilter: 'all',
    });
  };

  const hasActiveFilters = filters.status.length > 0 || 
    filters.dateRange !== 'all' || 
    filters.staleness !== 'all' || 
    filters.searchQuery !== '' ||
    filters.quickFilter !== 'all';

  const getFilterCount = (filterType: string): string => {
    const count = counts[filterType as keyof FilterCounts] || 0;
    const total = counts.total || 0;
    return `${count}/${total}`;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search manifests by title, tracking ID, job number, or RMN..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleFilterChange('searchQuery', '')}
                disabled={!filters.searchQuery}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters - Windows App Style */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Active Manifests</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex-shrink-0"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Quick Filter Tabs */}
          <Tabs 
            value={filters.quickFilter} 
            onValueChange={(value) => handleFilterChange('quickFilter', value)}
            className="w-full"
          >
            <TabsList className="flex flex-wrap w-full gap-1 p-1 h-auto">
              {QUICK_FILTERS.map((filter) => (
                <TabsTrigger 
                  key={filter.value} 
                  value={filter.value}
                  className="flex flex-col items-center gap-1 p-2 h-auto min-h-[70px] text-center flex-1 min-w-[80px] max-w-[120px]"
                >
                  <span className="text-sm">{filter.icon}</span>
                  <span className="text-xs font-medium leading-tight text-center">
                    {filter.label.length > 12 ? filter.label.split(' ')[0] : filter.label}
                  </span>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {getFilterCount(filter.value)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Status Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={status.value}
                          checked={filters.status.includes(status.value)}
                          onCheckedChange={() => handleStatusToggle(status.value)}
                        />
                        <Label 
                          htmlFor={status.value} 
                          className="text-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Select 
                    value={filters.dateRange} 
                    onValueChange={(value) => handleFilterChange('dateRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {filters.dateRange === 'custom' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          placeholder="From"
                          value={filters.customDateFrom || ''}
                          onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          placeholder="To"
                          value={filters.customDateTo || ''}
                          onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Staleness Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Data Freshness</Label>
                  <Select 
                    value={filters.staleness} 
                    onValueChange={(value) => handleFilterChange('staleness', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="fresh">Fresh (&lt; 30m)</SelectItem>
                      <SelectItem value="stale">Stale (30m - 2h)</SelectItem>
                      <SelectItem value="old">Old (&gt; 2h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span>Active filters:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.status.length} status{filters.status.length > 1 ? 'es' : ''}
                  </Badge>
                )}
                {filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.dateRange === 'custom' ? 'Custom date range' : filters.dateRange}
                  </Badge>
                )}
                {filters.staleness !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.staleness} data
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: &quot;{filters.searchQuery}&quot;
                  </Badge>
                )}
                {filters.quickFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {QUICK_FILTERS.find(f => f.value === filters.quickFilter)?.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
