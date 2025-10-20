// src/app/dashboard/drivers/page.tsx
'use client';

import {
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    Edit,
    FileText,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Shield,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { BackToTop } from '../../../components/ui/back-to-top';
import { Button } from '../../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Pagination } from '../../../components/ui/pagination';

interface Driver {
  id: number;
  name: string;
  contactNr: string;
  idNumber: string;
  pictureLoaded: boolean;
  countryOfOrigin: string;
  dateTimeAdded: string;
  displayValue: string;
  info?: string;
}

// Mock data based on the desktop app structure
const mockDrivers: Driver[] = [
  {
    id: 21677,
    name: 'LONGINO TOLOT',
    contactNr: '255755340307',
    idNumber: 'TAE719089',
    pictureLoaded: false,
    countryOfOrigin: 'TANZANIA',
    dateTimeAdded: '6/22/2024 8:35 PM',
    displayValue: 'LONGINO TOLOT(TZ)',
  },
  {
    id: 19280,
    name: 'OMARY SAID OM',
    contactNr: '0973143403',
    idNumber: '1459820',
    pictureLoaded: false,
    countryOfOrigin: 'TANZANIA',
    dateTimeAdded: '2/23/2024 6:08 AM',
    displayValue: 'OMARY SAID OM(TZ)',
  },
  {
    id: 10797,
    name: 'SALANJE MWADI',
    contactNr: '',
    idNumber: 'TAE049377',
    pictureLoaded: false,
    countryOfOrigin: 'TANZANIA',
    dateTimeAdded: '3/2/2023 1:58 PM',
    displayValue: 'SALANJE MWADI(TZ)',
  },
  {
    id: 19579,
    name: 'ABDALLAH MOH',
    contactNr: '250689078310',
    idNumber: 'TAE684555',
    pictureLoaded: true,
    countryOfOrigin: 'ZAMBIA',
    dateTimeAdded: '3/9/2024 12:22 PM',
    displayValue: 'ABDALLAH MOH(ZM)',
  },
  {
    id: 18432,
    name: 'JOHN DOE',
    contactNr: '1234567890',
    idNumber: 'US123456',
    pictureLoaded: true,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '1/15/2024 10:30 AM',
    displayValue: 'JOHN DOE(US)',
  },
  {
    id: 34751,
    name: 'DALE JONES MWANACHAMPA',
    contactNr: '260977123456',
    idNumber: 'ZM123456',
    pictureLoaded: false,
    countryOfOrigin: 'ZAMBIA',
    dateTimeAdded: '1/20/2024 2:15 PM',
    displayValue: 'DALE JONES MWANACHAMPA(ZM)',
  },
  {
    id: 15532,
    name: 'DAMAS KASIAN MISUNZA',
    contactNr: '255123456789',
    idNumber: 'TZ789012',
    pictureLoaded: true,
    countryOfOrigin: 'TANZANIA',
    dateTimeAdded: '2/15/2024 9:30 AM',
    displayValue: 'DAMAS KASIAN MISUNZA(TZ)',
  },
  {
    id: 22362,
    name: 'DANIEL AMOS',
    contactNr: '255987654321',
    idNumber: 'TZ345678',
    pictureLoaded: false,
    countryOfOrigin: 'TANZANIA',
    dateTimeAdded: '3/10/2024 4:45 PM',
    displayValue: 'DANIEL AMOS(TZ)',
  },
];

export default function DriversPage() {
  if (typeof window !== 'undefined' && window.location.pathname === '/dashboard/drivers') {
    window.location.replace('/dashboard/drivers/card-view');
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.contactNr.includes(searchQuery) ||
      driver.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.countryOfOrigin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pagedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectDriver = (driverId: number) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrivers.length === filteredDrivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(filteredDrivers.map((driver) => driver.id));
    }
  };

  const handleDriverAction = (action: string, driver: Driver) => {
    console.log(`${action} action for driver:`, driver.name);
    // TODO: Implement actual action handlers
    switch (action) {
      case 'add':
        // Open add driver dialog
        break;
      case 'edit':
        // Open edit driver dialog
        break;
      case 'capture-incident':
        // Open incident capture dialog
        break;
      case 'generate-report':
        // Generate incident report
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
          <User className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
          <a
            href="/dashboard/drivers/card-view"
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Try Card View
          </a>
        </div>
        <p className="text-gray-600">
          Manage driver profiles, licenses, and performance
        </p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="search-container mb-2 sm:mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 order-1 sm:order-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto order-2 sm:order-none">
            <button
              onClick={() => handleDriverAction('add', {} as Driver)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Driver</span>
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {filteredDrivers.length} of {drivers.length} drivers
          {selectedDrivers.length > 0 && (
            <span className="ml-2 text-amber-600">
              • {selectedDrivers.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedDrivers.length === filteredDrivers.length &&
                      filteredDrivers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Nr
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Picture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  className={`hover:bg-gray-50 ${
                    selectedDrivers.includes(driver.id) ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver.id)}
                      onChange={() => handleSelectDriver(driver.id)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Driver Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDriverAction('edit', driver)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Driver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDriverAction('capture-incident', driver)
                          }
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Incident
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDriverAction('generate-report', driver)
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Incident Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.contactNr || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.idNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {driver.pictureLoaded ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.countryOfOrigin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(driver.dateTimeAdded)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.displayValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No drivers found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'No drivers have been added yet'}
            </p>
          </div>
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filteredDrivers.length} onPageChange={setPage} />

      <BackToTop />

      {/* Feature Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <CreditCard className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            License Management
          </h3>
          <p className="text-gray-600 mb-4">
            Track driver licenses and certifications
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Licenses →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Shield className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Safety Records
          </h3>
          <p className="text-gray-600 mb-4">
            Monitor safety performance and incidents
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Records →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Clock className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Work Hours
          </h3>
          <p className="text-gray-600 mb-4">
            Track driving hours and compliance
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Hours →
          </button>
        </div>
      </div>
    </div>
  );
}
