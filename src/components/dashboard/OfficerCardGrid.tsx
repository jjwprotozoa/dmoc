// src/components/dashboard/OfficerCardGrid.tsx
// OfficerCardGrid: Privacy-aware cards similar to drivers, without tenant badges
import { useState } from 'react';
import { 
  Phone, 
  User, 
  Lock, 
  Unlock,
  MoreHorizontal,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SensitiveDataField } from '@/components/ui/sensitive-data-field';
import { PrivacyNotice } from '@/components/ui/privacy-notice';
import { useSession } from 'next-auth/react';

interface Officer {
  id: string;
  tenantId?: string;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  contactNr?: string | null; // Legacy contact number
  idNumber?: string | null; // Legacy ID number
  pictureLoaded?: boolean; // Picture loaded status
  countryOfOrigin?: string | null; // Country of origin
  displayValue?: string | null; // Display value
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface OfficerCardGridProps {
  officers: Officer[];
}

// Helper to format phone number (basic masking)
function formatPhoneNumber(phone: string | null | undefined, canView: boolean, isUnlocked: boolean): { display: string; masked: boolean } {
  if (!phone) return { display: 'N/A', masked: false };
  if (canView || isUnlocked) return { display: phone, masked: false };
  // Mask phone number
  if (phone.length <= 4) return { display: '****', masked: true };
  return { display: phone.slice(0, 2) + '****' + phone.slice(-2), masked: true };
}

// Helper to format email (basic masking)
function formatEmail(email: string | null | undefined, canView: boolean, isUnlocked: boolean): { display: string; masked: boolean } {
  if (!email) return { display: 'N/A', masked: false };
  if (canView || isUnlocked) return { display: email, masked: false };
  // Mask email
  const [name, domain] = email.split('@');
  if (!domain) return { display: '***@***', masked: true };
  const maskedName = name.length <= 2 ? '***' : name[0] + '***' + name[name.length - 1];
  return { display: `${maskedName}@${domain}`, masked: true };
}

export default function OfficerCardGrid({ officers }: OfficerCardGridProps) {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role?.toLowerCase() || 'viewer';
  const canViewSensitive = ['admin', 'manager'].includes(currentUserRole);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [unlockedOfficers, setUnlockedOfficers] = useState<Set<string>>(new Set());

  const handleUnlockOfficer = (officerId: string) => {
    setUnlockedOfficers(prev => {
      const next = new Set(prev);
      if (next.has(officerId)) {
        next.delete(officerId);
      } else {
        next.add(officerId);
      }
      return next;
    });
  };

  const privacyConfig = {
    userRole: currentUserRole,
    canViewSensitive,
    unlockedItems: unlockedOfficers,
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {officers.map((officer) => {
          const isUnlocked = unlockedOfficers.has(officer.id);
          const phoneInfo = formatPhoneNumber(officer.phone, canViewSensitive, isUnlocked);
          const emailInfo = formatEmail(officer.email, canViewSensitive, isUnlocked);

          return (
            <div
              key={officer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {officer.name}
                    </h3>
                    {officer.role && (
                      <p className="text-xs text-gray-500">
                        {officer.role}
                      </p>
                    )}
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
                    <DropdownMenuLabel>Officer Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSelectedOfficer(officer)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Officer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {officer.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Phone:</span>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-gray-900 ${phoneInfo.masked ? 'font-mono' : ''}`}
                      >
                        {phoneInfo.display}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle call action
                        }}
                        className="text-amber-600 hover:text-amber-700"
                        title="Call officer"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      {phoneInfo.masked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockOfficer(officer.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title={isUnlocked ? 'Lock information' : 'Unlock information'}
                        >
                          {isUnlocked ? (
                            <Unlock className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {officer.email && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Email:</span>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-gray-900 ${emailInfo.masked ? 'font-mono text-xs' : ''}`}
                      >
                        {emailInfo.display}
                      </span>
                      {emailInfo.masked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockOfficer(officer.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title={isUnlocked ? 'Lock information' : 'Unlock information'}
                        >
                          {isUnlocked ? (
                            <Unlock className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      officer.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {officer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOfficer} onOpenChange={() => setSelectedOfficer(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOfficer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOfficer.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedOfficer.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {selectedOfficer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </DialogDescription>
              </DialogHeader>

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 mx-auto">
                <User className="w-10 h-10 text-gray-500" />
              </div>

              {/* Detail Fields */}
              <div className="space-y-3 mb-4">
                <div className="flex text-sm">
                  <span className="font-medium w-32 text-gray-500">Officer ID:</span>
                  <span className="text-gray-900">{selectedOfficer.id}</span>
                </div>
                {selectedOfficer.role && (
                  <div className="flex text-sm">
                    <span className="font-medium w-32 text-gray-500">Role:</span>
                    <span className="text-gray-900">{selectedOfficer.role}</span>
                  </div>
                )}
                {selectedOfficer.phone && (
                  <div className="flex text-sm">
                    <span className="font-medium w-32 text-gray-500">Phone:</span>
                    <SensitiveDataField
                      label=""
                      value={selectedOfficer.phone}
                      type="contact"
                      config={privacyConfig}
                    />
                  </div>
                )}
                {selectedOfficer.email && (
                  <div className="flex text-sm">
                    <span className="font-medium w-32 text-gray-500">Email:</span>
                    <SensitiveDataField
                      label=""
                      value={selectedOfficer.email}
                      type="email"
                      config={privacyConfig}
                    />
                  </div>
                )}
                {selectedOfficer.createdAt && (
                  <div className="flex text-sm">
                    <span className="font-medium w-32 text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOfficer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedOfficer.updatedAt && (
                  <div className="flex text-sm">
                    <span className="font-medium w-32 text-gray-500">Updated:</span>
                    <span className="text-gray-900">
                      {new Date(selectedOfficer.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <PrivacyNotice userRole={currentUserRole} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
