// src/app/dashboard/drivers/card-view/page.tsx
'use client';

import {
    ArrowLeft,
    Camera,
    CheckCircle,
    Clock,
    CreditCard,
    Edit,
    Eye,
    FileText,
    Lock,
    MoreHorizontal,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Shield,
    Unlock,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { AuthDialog } from '../../../../components/ui/auth-dialog';
import { Button } from '../../../../components/ui/button';
import { CallDialog } from '../../../../components/ui/call-dialog';
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

export default function DriversCardViewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [unlockedDrivers, setUnlockedDrivers] = useState<Set<number>>(
    new Set()
  );
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callDriver, setCallDriver] = useState<{
    name: string;
    phone: string;
    maskedPhone?: string;
  } | null>(null);

  // Privacy controls - in real app this would come from auth system
  const currentUserRole = 'operator'; // Mock role for demo
  const canViewSensitive = ['admin', 'manager'].includes(currentUserRole);

  // Privacy utility functions
  const maskIdNumber = (
    idNumber: string,
    userRole: string,
    driverId?: number
  ): string => {
    const isUnlocked = driverId ? unlockedDrivers.has(driverId) : false;
    if (canViewSensitive || isUnlocked) return idNumber;
    if (idNumber.length <= 4) return '*'.repeat(idNumber.length);
    const firstTwo = idNumber.substring(0, 2);
    const lastTwo = idNumber.substring(idNumber.length - 2);
    const maskedMiddle = '*'.repeat(idNumber.length - 4);
    return `${firstTwo}${maskedMiddle}${lastTwo}`;
  };

  const formatContactNumber = (
    contactNumber: string,
    userRole: string,
    driverId?: number
  ) => {
    if (!contactNumber || contactNumber.length === 0) {
      return { display: 'N/A', link: undefined, masked: false };
    }

    const isUnlocked = driverId ? unlockedDrivers.has(driverId) : false;
    const masked = !canViewSensitive && !isUnlocked;
    let display = contactNumber;
    let link = undefined;

    if (masked) {
      if (contactNumber.length <= 7) {
        display = '*'.repeat(contactNumber.length);
      } else {
        const firstThree = contactNumber.substring(0, 3);
        const lastFour = contactNumber.substring(contactNumber.length - 4);
        const maskedMiddle = '*'.repeat(contactNumber.length - 7);
        display = `${firstThree}${maskedMiddle}${lastFour}`;
      }
    } else {
      link = `tel:${contactNumber}`;
    }

    return { display, link, masked };
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.contactNr.includes(searchQuery) ||
      driver.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.countryOfOrigin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDriver = (driverId: number) => {
    setSelectedDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId]
    );
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

  const handleAuthenticated = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleUnlockDriver = (driverId: number) => {
    if (canViewSensitive) {
      // Admin/manager can always unlock
      setUnlockedDrivers((prev) => new Set([...prev, driverId]));
    } else {
      // Regular users need authentication for each card
      setPendingAction(
        () => () => setUnlockedDrivers((prev) => new Set([...prev, driverId]))
      );
      setShowAuthDialog(true);
    }
  };

  const handleCallDriver = (driver: Driver) => {
    if (!driver.contactNr || driver.contactNr.length === 0) {
      return;
    }

    const contactInfo = formatContactNumber(
      driver.contactNr,
      currentUserRole,
      driver.id
    );

    // Always open call dialog immediately, but pass masked number if not unlocked
    setCallDriver({
      name: driver.name,
      phone: driver.contactNr,
      maskedPhone: contactInfo.masked ? contactInfo.display : undefined,
    });
    setShowCallDialog(true);
  };

  const handleCall = (phoneNumber: string) => {
    console.log('Calling:', phoneNumber);
    // In a real app, this would integrate with telephony service
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

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      TANZANIA: '🇹🇿',
      ZAMBIA: '🇿🇲',
      UNKNOWN: '❓',
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="page-header">
          <div className="page-header-title">
            <User className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
              <p className="text-gray-600">Card view • Mobile-optimized layout</p>
            </div>
          </div>
          <div className="page-header-actions">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Card view</span>
            <a
              href="/dashboard/drivers"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Table
            </a>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Privacy Notice
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Current role:{' '}
            <span className="font-semibold">{currentUserRole}</span> •
            {canViewSensitive ? (
              <span className="text-green-700">
                {' '}
                Full access to sensitive data
              </span>
            ) : (
              <span className="text-orange-700">
                {' '}
                Limited access - each card requires individual authentication
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="search-container mb-2 sm:mb-4">
          {/* Row 1: Search input on its own line */}
          <div className="flex items-center gap-3 w-full order-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-10 pr-4 h-11 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Row 2: Actions under search */}
          <div className="flex flex-wrap items-center gap-2 order-2 w-full mt-2">
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none">
              Clear
            </button>
            <button
              onClick={() => handleDriverAction('add', {} as Driver)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span>Add Driver</span>
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-1 sm:flex-none">
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

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
              selectedDrivers.includes(driver.id)
                ? 'ring-2 ring-amber-500 bg-amber-50'
                : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDrivers.includes(driver.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectDriver(driver.id);
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getCountryFlag(driver.countryOfOrigin)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {driver.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {driver.countryOfOrigin}
                    </p>
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
                    Generate Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Contact:</span>
                <div className="flex items-center space-x-1">
                  {(() => {
                    const contactInfo = formatContactNumber(
                      driver.contactNr,
                      currentUserRole,
                      driver.id
                    );
                    const isUnlocked = unlockedDrivers.has(driver.id);
                    return (
                      <>
                        <span
                          className={`text-gray-900 ${contactInfo.masked ? 'font-mono' : ''}`}
                        >
                          {contactInfo.display}
                        </span>
                        {driver.contactNr && driver.contactNr.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallDriver(driver);
                            }}
                            className="text-amber-600 hover:text-amber-700"
                            title="Call driver"
                          >
                            <Phone className="w-3 h-3" />
                          </button>
                        )}
                        {contactInfo.masked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnlockDriver(driver.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title={
                              isUnlocked
                                ? 'Lock information'
                                : 'Unlock information'
                            }
                          >
                            {isUnlocked ? (
                              <Unlock className="w-3 h-3" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">ID Number:</span>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-gray-900 font-mono ${!canViewSensitive && !unlockedDrivers.has(driver.id) ? 'text-gray-600' : ''}`}
                  >
                    {maskIdNumber(driver.idNumber, currentUserRole, driver.id)}
                  </span>
                  {!canViewSensitive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockDriver(driver.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title={
                        unlockedDrivers.has(driver.id)
                          ? 'Lock information'
                          : 'Unlock information'
                      }
                    >
                      {unlockedDrivers.has(driver.id) ? (
                        <Unlock className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Picture:</span>
                {driver.pictureLoaded ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Added {formatDate(driver.dateTimeAdded)}
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {getCountryFlag(driver.countryOfOrigin)}
                        </span>
                        <span>{driver.name}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Complete driver information and profile details
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Driver Photo Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Driver Photo
                        </h3>
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          {driver.pictureLoaded ? (
                            <div className="text-center">
                              <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Photo Available
                              </p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">No Photo</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Driver Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Driver Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Full Name
                            </label>
                            <p className="text-gray-900">{driver.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Contact Number
                            </label>
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const contactInfo = formatContactNumber(
                                  driver.contactNr,
                                  currentUserRole,
                                  driver.id
                                );
                                const isUnlocked = unlockedDrivers.has(
                                  driver.id
                                );
                                return (
                                  <>
                                    <p
                                      className={`text-gray-900 font-mono ${contactInfo.masked ? 'text-gray-600' : ''}`}
                                    >
                                      {contactInfo.display}
                                    </p>
                                    {driver.contactNr &&
                                      driver.contactNr.length > 0 && (
                                        <button
                                          onClick={() =>
                                            handleCallDriver(driver)
                                          }
                                          className="text-amber-600 hover:text-amber-700"
                                          title="Call driver"
                                        >
                                          <Phone className="w-4 h-4" />
                                        </button>
                                      )}
                                    {contactInfo.masked && (
                                      <button
                                        onClick={() =>
                                          handleUnlockDriver(driver.id)
                                        }
                                        className="text-gray-400 hover:text-gray-600"
                                        title={
                                          isUnlocked
                                            ? 'Lock information'
                                            : 'Unlock information'
                                        }
                                      >
                                        {isUnlocked ? (
                                          <Unlock className="w-4 h-4" />
                                        ) : (
                                          <Lock className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              ID Number
                            </label>
                            <div className="flex items-center space-x-2">
                              <p
                                className={`text-gray-900 font-mono ${!canViewSensitive && !unlockedDrivers.has(driver.id) ? 'text-gray-600' : ''}`}
                              >
                                {maskIdNumber(
                                  driver.idNumber,
                                  currentUserRole,
                                  driver.id
                                )}
                              </p>
                              {!canViewSensitive && (
                                <button
                                  onClick={() => handleUnlockDriver(driver.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title={
                                    unlockedDrivers.has(driver.id)
                                      ? 'Lock information'
                                      : 'Unlock information'
                                  }
                                >
                                  {unlockedDrivers.has(driver.id) ? (
                                    <Unlock className="w-4 h-4" />
                                  ) : (
                                    <Lock className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Country of Origin
                            </label>
                            <p className="text-gray-900">
                              {driver.countryOfOrigin}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Display Value
                            </label>
                            <p className="text-gray-900">
                              {driver.displayValue}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Date Added
                            </label>
                            <p className="text-gray-900">
                              {formatDate(driver.dateTimeAdded)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Driver ID
                            </label>
                            <p className="text-gray-900 font-mono text-sm">
                              {driver.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => handleDriverAction('edit', driver)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Driver
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleDriverAction('capture-incident', driver)
                        }
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Incident
                      </Button>
                      <Button
                        onClick={() =>
                          handleDriverAction('generate-report', driver)
                        }
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
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

      {/* Authentication Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
        title="View Sensitive Information"
        description="Please authenticate to view unmasked contact numbers and ID details for this specific driver"
      />

      {/* Call Dialog */}
      {callDriver && (
        <CallDialog
          open={showCallDialog}
          onOpenChange={setShowCallDialog}
          driverName={callDriver.name}
          phoneNumber={callDriver.phone}
          maskedPhoneNumber={callDriver.maskedPhone}
          onCall={handleCall}
        />
      )}
    </div>
  );
}
