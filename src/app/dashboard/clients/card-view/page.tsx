// src/app/dashboard/clients/card-view/page.tsx
'use client';

import {
    Building,
    Calendar,
    Download,
    Edit,
    Eye,
    Filter,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthDialog } from '../../../../components/ui/auth-dialog';
import { Button } from '../../../../components/ui/button';
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
import { PrivacyNotice } from '../../../../components/ui/privacy-notice';
import { SensitiveDataField } from '../../../../components/ui/sensitive-data-field';
import { debounce } from '../../../../lib/performance';
import { PrivacyConfig } from '../../../../lib/privacy';

interface Client {
  companyId: number;
  companyTypeId: number;
  entityTypeDescription: string;
  name: string;
  address: string;
  dateTimeAdded: string;
  id: number;
  displayValue: string;
  // Sensitive data fields for POPIA compliance
  contactNumber?: string;
  email?: string;
  primaryContact?: string;
  registrationNumber?: string;
}

// Mock data based on the desktop application screenshot
const mockClients: Client[] = [
  {
    companyId: 3103,
    companyTypeId: 1,
    entityTypeDescription: 'CLIENT',
    name: 'ACCESS',
    address: '123 Business Street, Johannesburg',
    dateTimeAdded: '12/10/2022 10:22 AM',
    id: 3103,
    displayValue: 'ACCESS',
    contactNumber: '0111234567',
    email: 'contact@access.co.za',
    primaryContact: 'John Smith',
    registrationNumber: 'REG123456',
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
    contactNumber: '255123456789',
    email: 'info@africawakawaka.co.tz',
    primaryContact: 'Maria Mwangi',
    registrationNumber: 'TZ789012',
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
    address: '456 Corporate Avenue, Cape Town',
    dateTimeAdded: '5/17/2024 9:44 PM',
    id: 3725,
    displayValue: 'DELTA',
    contactNumber: '0219876543',
    email: 'admin@delta.co.za',
    primaryContact: 'Sarah Johnson',
    registrationNumber: 'DEL456789',
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

export default function ClientsCardViewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [clients] = useState<Client[]>(mockClients);
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [unlockedClients, setUnlockedClients] = useState<Set<number>>(
    new Set()
  );

  // Debounce search input to prevent excessive filtering
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Privacy controls - in real app this would come from auth system
  const currentUserRole = 'operator'; // Mock role for demo
  const canViewSensitive = ['admin', 'manager'].includes(currentUserRole);

  const privacyConfig: PrivacyConfig = {
    userRole: currentUserRole,
    canViewSensitive,
    unlockedItems: unlockedClients,
  };

  // Memoize filtered clients to prevent unnecessary recalculations
  const filteredClients = useMemo(() => {
    if (!debouncedSearchQuery) return clients;
    
    const searchLower = debouncedSearchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.address.toLowerCase().includes(searchLower) ||
        client.displayValue.toLowerCase().includes(searchLower)
    );
  }, [clients, debouncedSearchQuery]);

  const handleSelectClient = useCallback((clientId: number) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handleAuthenticated = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleUnlockClient = (clientId: number) => {
    if (canViewSensitive) {
      // Admin/manager can always unlock
      setUnlockedClients((prev) => new Set([...prev, clientId]));
    } else {
      // Regular users need authentication for each client
      setPendingAction(
        () => () => setUnlockedClients((prev) => new Set([...prev, clientId]))
      );
      setShowAuthDialog(true);
    }
  };

  const handleClientAction = (action: string, client: Client) => {
    console.log(`${action} action for client:`, client.name);
    // TODO: Implement actual action handlers
    switch (action) {
      case 'add':
        // Open add client dialog
        break;
      case 'edit':
        // Open edit client dialog
        break;
      case 'view':
        // Open view client dialog
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Clients (Card View)
          </h1>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            A/B Test
          </span>
          <a
            href="/dashboard/clients"
            className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Back to Table View
          </a>
        </div>
        <p className="text-gray-600">
          Mobile-optimized card layout with detailed modal view
        </p>

        {/* Privacy Notice */}
        <PrivacyNotice userRole={currentUserRole} className="mt-4" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                Clear
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  showFilters
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <button
              onClick={() => handleClientAction('add', {} as Client)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
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

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredClients.length} of {clients.length} clients
          {selectedClients.length > 0 && (
            <span className="ml-2 text-amber-600">
              • {selectedClients.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
              selectedClients.includes(client.id)
                ? 'ring-2 ring-amber-500 bg-amber-50'
                : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectClient(client.id);
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-amber-600" />
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
                  <DropdownMenuLabel>Client Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleClientAction('view', client)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleClientAction('edit', client)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Client
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {client.name}
                </h3>
                <p className="text-xs text-gray-500">{client.displayValue}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Company ID:</span>
                <span className="text-gray-900 font-mono">
                  {client.companyId}
                </span>
              </div>

              {/* Sensitive Data Fields */}
              {client.contactNumber && (
                <SensitiveDataField
                  label="Contact"
                  value={client.contactNumber}
                  type="contact"
                  config={privacyConfig}
                  itemId={client.id}
                  onUnlock={handleUnlockClient}
                />
              )}

              {client.email && (
                <SensitiveDataField
                  label="Email"
                  value={client.email}
                  type="email"
                  config={privacyConfig}
                  itemId={client.id}
                  onUnlock={handleUnlockClient}
                />
              )}

              {client.registrationNumber && (
                <SensitiveDataField
                  label="Registration"
                  value={client.registrationNumber}
                  type="id"
                  config={privacyConfig}
                  itemId={client.id}
                  onUnlock={handleUnlockClient}
                />
              )}

              <SensitiveDataField
                label="Address"
                value={client.address || 'No address'}
                type="address"
                config={privacyConfig}
                itemId={client.id}
                onUnlock={handleUnlockClient}
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Type:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {client.entityTypeDescription}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Added {formatDate(client.dateTimeAdded)}
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
                  <DialogContent size="2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Building className="w-6 h-6 text-amber-600" />
                        <span>{client.name}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Complete client information and company details
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Client Logo Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Company Logo
                        </h3>
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Building className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Logo Placeholder
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Client Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Company Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Company Name
                            </label>
                            <p className="text-gray-900">{client.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Display Value
                            </label>
                            <p className="text-gray-900">
                              {client.displayValue}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Company ID
                            </label>
                            <p className="text-gray-900 font-mono">
                              {client.companyId}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Address
                            </label>
                            <p className="text-gray-900">
                              {client.address || (
                                <span className="text-gray-400 italic">
                                  No address provided
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Entity Type
                            </label>
                            <p className="text-gray-900">
                              {client.entityTypeDescription}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Date Added
                            </label>
                            <p className="text-gray-900">
                              {formatDate(client.dateTimeAdded)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Client ID
                            </label>
                            <p className="text-gray-900 font-mono text-sm">
                              {client.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => handleClientAction('edit', client)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Client
                      </Button>
                      <Button
                        onClick={() => handleClientAction('view', client)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Reports
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'No clients have been added yet'}
          </p>
        </div>
      )}

      {/* Feature Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Building className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Company Management
          </h3>
          <p className="text-gray-600 mb-4">
            Manage client companies and their profiles
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Companies →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <MapPin className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Location Tracking
          </h3>
          <p className="text-gray-600 mb-4">
            Track client locations and service areas
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Locations →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Calendar className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Client History
          </h3>
          <p className="text-gray-600 mb-4">
            View client activity and service history
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View History →
          </button>
        </div>
      </div>

      {/* Authentication Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
        title="View Sensitive Information"
        description="Please authenticate to view unmasked contact numbers and company details for this specific client"
      />
    </div>
  );
}
