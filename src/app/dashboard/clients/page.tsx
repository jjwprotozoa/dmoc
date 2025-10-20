// src/app/dashboard/clients/page.tsx
'use client';

import {
    Building,
    Calendar,
    CheckSquare2,
    Download,
    Filter,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Client {
  companyId: number;
  companyTypeId: number;
  entityTypeDescription: string;
  name: string;
  address: string;
  dateTimeAdded: string;
  id: number;
  displayValue: string;
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data based on the desktop application screenshot
  const clients: Client[] = [
    {
      companyId: 3103,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'ACCESS',
      address: '',
      dateTimeAdded: '12/10/2022 10:22 AM',
      id: 3103,
      displayValue: 'ACCESS',
    },
    {
      companyId: 3881,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'AFRICA WAKAWAKA',
      address: 'TANZANIA',
      dateTimeAdded: '11/16/2024 8:57 AM',
      id: 3881,
      displayValue: 'AFRICA WAKAWAKA',
    },
    {
      companyId: 3300,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'AFRICLAN',
      address: '',
      dateTimeAdded: '4/13/2023 5:50 PM',
      id: 3300,
      displayValue: 'AFRICLAN',
    },
    {
      companyId: 4087,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'CML / NYATI MUFULIRA TO DURBAN',
      address: 'CML / Nyati Mufulira to Durban',
      dateTimeAdded: '6/24/2025 10:04 AM',
      id: 4087,
      displayValue: 'CML / NYATI MUFULIRA TO [',
    },
    {
      companyId: 3725,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'DELTA',
      address: '',
      dateTimeAdded: '5/17/2024 9:44 PM',
      id: 3725,
      displayValue: 'DELTA',
    },
    {
      companyId: 3726,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'DELTA FORCE / ZERODEGREES',
      address: '',
      dateTimeAdded: '5/17/2024 9:45 PM',
      id: 3726,
      displayValue: 'DELTA FORCE / ZERODEGREES',
    },
    {
      companyId: 3727,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'DELTA PUMA RISK',
      address: '',
      dateTimeAdded: '5/17/2024 9:46 PM',
      id: 3727,
      displayValue: 'DELTA PUMA RISK',
    },
    {
      companyId: 3728,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'DELTA ESCORTS/CML KANSANSHI-DAR',
      address: '',
      dateTimeAdded: '5/17/2024 9:47 PM',
      id: 3728,
      displayValue: 'DELTA ESCORTS/CML KANSANSHI-DAR',
    },
    {
      companyId: 3729,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'DELTA/POLYTRA',
      address: '',
      dateTimeAdded: '5/17/2024 9:48 PM',
      id: 3729,
      displayValue: 'DELTA/POLYTRA',
    },
    {
      companyId: 3730,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'GREENDOOR',
      address: '',
      dateTimeAdded: '5/17/2024 9:49 PM',
      id: 3730,
      displayValue: 'GREENDOOR',
    },
    {
      companyId: 3731,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'INARA',
      address: '',
      dateTimeAdded: '5/17/2024 9:50 PM',
      id: 3731,
      displayValue: 'INARA',
    },
    {
      companyId: 3732,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'INARA (LIBERTY)',
      address: '',
      dateTimeAdded: '5/17/2024 9:51 PM',
      id: 3732,
      displayValue: 'INARA (LIBERTY)',
    },
    {
      companyId: 3733,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'INARA MOXICO',
      address: '',
      dateTimeAdded: '5/17/2024 9:52 PM',
      id: 3733,
      displayValue: 'INARA MOXICO',
    },
    {
      companyId: 3734,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'KOBRACLIENT2',
      address: '',
      dateTimeAdded: '5/17/2024 9:53 PM',
      id: 3734,
      displayValue: 'KOBRACLIENT2',
    },
    {
      companyId: 3735,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'LINK AFRICA',
      address: '',
      dateTimeAdded: '5/17/2024 9:54 PM',
      id: 3735,
      displayValue: 'LINK AFRICA',
    },
    {
      companyId: 3736,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'MYSTICAL',
      address: '',
      dateTimeAdded: '5/17/2024 9:55 PM',
      id: 3736,
      displayValue: 'MYSTICAL',
    },
    {
      companyId: 3737,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD ADD',
      address: '',
      dateTimeAdded: '5/17/2024 9:56 PM',
      id: 3737,
      displayValue: 'RELOAD ADD',
    },
    {
      companyId: 3738,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD CITIC',
      address: '',
      dateTimeAdded: '5/17/2024 9:57 PM',
      id: 3738,
      displayValue: 'RELOAD CITIC',
    },
    {
      companyId: 3739,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD CNMC/IXMTRACKING',
      address: '',
      dateTimeAdded: '5/17/2024 9:58 PM',
      id: 3739,
      displayValue: 'RELOAD CNMC/IXMTRACKING',
    },
    {
      companyId: 3740,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD DELTA ASK',
      address: '',
      dateTimeAdded: '5/17/2024 9:59 PM',
      id: 3740,
      displayValue: 'RELOAD DELTA ASK',
    },
    {
      companyId: 3741,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD KABWE/GRB',
      address: '',
      dateTimeAdded: '5/17/2024 10:00 PM',
      id: 3741,
      displayValue: 'RELOAD KABWE/GRB',
    },
    {
      companyId: 3742,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD LCS',
      address: '',
      dateTimeAdded: '5/17/2024 10:01 PM',
      id: 3742,
      displayValue: 'RELOAD LCS',
    },
    {
      companyId: 3743,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD TFC ASK',
      address: '',
      dateTimeAdded: '5/17/2024 10:02 PM',
      id: 3743,
      displayValue: 'RELOAD TFC ASK',
    },
    {
      companyId: 3744,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD TFC HMC',
      address: '',
      dateTimeAdded: '5/17/2024 10:03 PM',
      id: 3744,
      displayValue: 'RELOAD TFC HMC',
    },
    {
      companyId: 3745,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD TFC OCTAGON/RLD-CMS/KCM',
      address: '',
      dateTimeAdded: '5/17/2024 10:04 PM',
      id: 3745,
      displayValue: 'RELOAD TFC OCTAGON/RLD-CMS/KCM',
    },
    {
      companyId: 3746,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD TFC RGT',
      address: '',
      dateTimeAdded: '5/17/2024 10:05 PM',
      id: 3746,
      displayValue: 'RELOAD TFC RGT',
    },
    {
      companyId: 3747,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD TRAFIGURA',
      address: '',
      dateTimeAdded: '5/17/2024 10:06 PM',
      id: 3747,
      displayValue: 'RELOAD TRAFIGURA',
    },
    {
      companyId: 3748,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD/DELTA LONSHI TRACKING',
      address: '',
      dateTimeAdded: '5/17/2024 10:07 PM',
      id: 3748,
      displayValue: 'RELOAD/DELTA LONSHI TRACKING',
    },
    {
      companyId: 3749,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD/DELTA/TFC/MRI (ZAM_MZ)',
      address: '',
      dateTimeAdded: '5/17/2024 10:08 PM',
      id: 3749,
      displayValue: 'RELOAD/DELTA/TFC/MRI (ZAM_MZ)',
    },
    {
      companyId: 3750,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD/MALMOZA/DELTA - TFC',
      address: '',
      dateTimeAdded: '5/17/2024 10:09 PM',
      id: 3750,
      displayValue: 'RELOAD/MALMOZA/DELTA - TFC',
    },
    {
      companyId: 3751,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD/ZOPCO/DELTA BLISTERS',
      address: '',
      dateTimeAdded: '5/17/2024 10:10 PM',
      id: 3751,
      displayValue: 'RELOAD/ZOPCO/DELTA BLISTERS',
    },
    {
      companyId: 3752,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RELOAD/ZOPCO/DELTA CATHODES',
      address: '',
      dateTimeAdded: '5/17/2024 10:11 PM',
      id: 3752,
      displayValue: 'RELOAD/ZOPCO/DELTA CATHODES',
    },
    {
      companyId: 3753,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RL/DELTA/ZAM - TN/BBR/GRB',
      address: '',
      dateTimeAdded: '5/17/2024 10:12 PM',
      id: 3753,
      displayValue: 'RL/DELTA/ZAM - TN/BBR/GRB',
    },
    {
      companyId: 3754,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'RL/DELTA/TFC NDOLA TO DAR',
      address: '',
      dateTimeAdded: '5/17/2024 10:13 PM',
      id: 3754,
      displayValue: 'RL/DELTA/TFC NDOLA TO DAR',
    },
    {
      companyId: 3755,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'TEST CLIENT',
      address: '',
      dateTimeAdded: '5/17/2024 10:14 PM',
      id: 3755,
      displayValue: 'TEST CLIENT',
    },
    {
      companyId: 3756,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'TEST CLIENT 3',
      address: '',
      dateTimeAdded: '5/17/2024 10:15 PM',
      id: 3756,
      displayValue: 'TEST CLIENT 3',
    },
    {
      companyId: 3757,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'TEST CLIENT2',
      address: '',
      dateTimeAdded: '5/17/2024 10:16 PM',
      id: 3757,
      displayValue: 'TEST CLIENT2',
    },
    {
      companyId: 3758,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'TESTING CLIENT',
      address: '',
      dateTimeAdded: '5/17/2024 10:17 PM',
      id: 3758,
      displayValue: 'TESTING CLIENT',
    },
    {
      companyId: 3759,
      companyTypeId: 1,
      entityTypeDescription: 'CLIENT',
      name: 'ZALAWI ZAMBIA',
      address: '',
      dateTimeAdded: '5/17/2024 10:18 PM',
      id: 3759,
      displayValue: 'ZALAWI ZAMBIA',
    },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map((client) => client.id));
    }
  };

  const handleSelectClient = (clientId: number) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Redirect to card view by default on first-level route
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path === '/dashboard/clients') {
      window.location.replace('/dashboard/clients/card-view');
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="page-header page-header-compact">
        <div className="page-header-title">
          <Users className="w-8 h-8 text-amber-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage client companies and information</p>
          </div>
          <a
            href="/dashboard/clients/card-view"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors ml-1"
          >
            Card view
          </a>
        </div>
        <div className="page-header-actions search-container">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  new Set(
                    clients.filter((c) => c.address).map((c) => c.address)
                  ).size
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  clients.filter((c) => {
                    const date = new Date(c.dateTimeAdded);
                    const now = new Date();
                    return (
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, address, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            {selectedClients.length > 0 && (
              <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2">
                <CheckSquare2 className="w-4 h-4" />
                <span>{selectedClients.length} Selected</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>All Types</option>
                  <option>CLIENT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>All Locations</option>
                  <option>TANZANIA</option>
                  <option>Zambia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Added
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>All Time</option>
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Client Directory
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>
                {filteredClients.length} of {clients.length} clients
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedClients.length === filteredClients.length &&
                      filteredClients.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <Building className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.displayValue}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.companyId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.address || (
                      <span className="text-gray-400 italic">No address</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.dateTimeAdded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {client.entityTypeDescription}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-amber-600 hover:text-amber-900 transition-colors">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        Edit
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredClients.length}</span> of{' '}
              <span className="font-medium">{clients.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-amber-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top */}
      {/* The component is lightweight and only appears after scroll */}
      {/* Imported relatively to avoid heavy layout shifts */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <></>
    </div>
  );
}
