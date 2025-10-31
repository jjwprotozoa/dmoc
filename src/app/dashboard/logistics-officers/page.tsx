// src/app/dashboard/logistics-officers/page.tsx
// Logistics Officers main page: Card-based, filterable, privacy-aware display/grid
'use client';

import { useState } from 'react';
import OfficerCardGrid from '@/components/dashboard/OfficerCardGrid';
import { trpc } from '@/lib/trpc';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 24;

export default function LogisticsOfficersPage() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [isActive, setIsActive] = useState(''); // '', 'true', 'false'
  const [page, setPage] = useState(1);

  // Get officers (paged, filtered) - tenantId now comes from session automatically
  const { data, isLoading, error } = trpc.logisticsOfficers.list.useQuery({
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    search: search.trim().length > 0 ? search.trim() : undefined,
    country: country || undefined,
    isActive: isActive === '' ? undefined : isActive === 'true',
  });
  // Get country options
  const { data: countryData, isLoading: countryLoading } = trpc.countries.list.useQuery();

  const countryOptions = [
    { value: '', label: 'All Countries' },
    ...(countryData || []).map(c => ({ value: c.name, label: c.name }))
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <span>Logistics Officers</span>
        </h1>
        <p className="text-gray-600 mt-1 mb-7">
          Manage logistics staff and their operational responsibilities
        </p>

        {/* Filter/search bar */}
        <div className="flex flex-col md:flex-row gap-3 md:items-end mb-6">
          {/* Search input - prevent enter from submitting from default form/refresh */}
          <div>
            <label htmlFor="officer-search" className="block text-xs text-gray-500 mb-1">
              Search Officer
            </label>
            <input
              id="officer-search"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
              className="border p-2 rounded w-full md:w-64"
              type="text"
              autoComplete="off"
            />
          </div>
          {/* Country filter */}
          <div>
            <label htmlFor="countryFilter" className="block text-xs text-gray-500 mb-1">Country</label>
            <select
              id="countryFilter"
              value={country}
              onChange={e => { setCountry(e.target.value); setPage(1); }}
              className="border p-2 rounded w-full md:w-40"
              disabled={countryLoading}
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Active/inactive filter */}
          <div>
            <label htmlFor="activeFilter" className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              id="activeFilter"
              value={isActive}
              onChange={e => { setIsActive(e.target.value); setPage(1); }}
              className="border p-2 rounded w-full md:w-32"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-gray-500">Loading officers...</div>}
      {error && <div className="text-red-600">Failed to load officers.</div>}
      {!isLoading && !error && (
        data && data.officers.length > 0 ? (
          <>
            <OfficerCardGrid officers={data.officers} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="text-gray-500">No officers found.</div>
        )
      )}
    </div>
  );
}
