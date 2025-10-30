// src/components/dashboard/OfficerCardGrid.tsx
// OfficerCardGrid: Privacy-aware, complete modal detail for all officer fields
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SensitiveDataField } from '@/components/ui/sensitive-data-field';
import { PrivacyNotice } from '@/components/ui/privacy-notice';

interface Officer {
  id: string;
  tenantId?: string;
  tenant?: { label: string; color: string };
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface OfficerCardGridProps {
  officers: Officer[];
}

// TODO: Replace with real role/current user context
const mockRole = 'manager';
const privacyConfig = {
  userRole: mockRole,
  canViewSensitive: ['admin', 'manager'].includes(mockRole),
  unlockedItems: new Set<number>(), // Expansion: allow unlocking record-by-record
};

export default function OfficerCardGrid({ officers }: OfficerCardGridProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {officers.map((officer) => (
          <Card key={officer.id} className="flex flex-col h-full cursor-pointer hover:shadow-lg"
            onClick={() => setSelectedOfficer(officer)}
          >
            <CardContent className="flex flex-col items-start justify-between h-full p-5">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium bg-${officer.tenant?.color || 'gray'}-100 text-${officer.tenant?.color || 'gray'}-800 mb-2`}>
                {officer.tenant?.label || 'Tenant'}
              </span>
              <div className="flex-1">
                <div className="text-lg font-semibold">{officer.name}</div>
              </div>
              <span className={
                officer.isActive
                  ? 'inline-block mt-4 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium'
                  : 'inline-block mt-4 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium'
              }>
                {officer.isActive ? 'Active' : 'Inactive'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedOfficer} onOpenChange={() => setSelectedOfficer(null)}>
        <DialogContent>
          {selectedOfficer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOfficer.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mb-4">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium bg-${selectedOfficer.tenant?.color || 'gray'}-100 text-${selectedOfficer.tenant?.color || 'gray'}-800 mr-2`}>
                    {selectedOfficer.tenant?.label || 'Tenant'}
                  </span>
                  <span className={
                    selectedOfficer.isActive
                      ? 'inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium'
                      : 'inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium'
                  }>
                    {selectedOfficer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </DialogDescription>
              </DialogHeader>
              {/* Avatar/photo placeholder */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 mx-auto">
                {/* If image is ever available: <img src={selectedOfficer.photoUrl} ... /> */}
              </div>

              {/* Detail Fields Block */}
              <div className="space-y-2 mb-3">
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Officer ID:</span><span>{selectedOfficer.id}</span></div>
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Role:</span><span>{selectedOfficer.role || 'N/A'}</span></div>
                {selectedOfficer.email && (
                  <SensitiveDataField
                    label="Email"
                    value={selectedOfficer.email}
                    type="email"
                    config={privacyConfig}
                  />
                )}
                {selectedOfficer.phone && (
                  <SensitiveDataField
                    label="Phone"
                    value={selectedOfficer.phone}
                    type="contact"
                    config={privacyConfig}
                  />
                )}
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Created:</span><span>{selectedOfficer.createdAt ? new Date(selectedOfficer.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Updated:</span><span>{selectedOfficer.updatedAt ? new Date(selectedOfficer.updatedAt).toLocaleDateString() : 'N/A'}</span></div>
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Tenant:</span><span>{selectedOfficer.tenant?.label || 'N/A'}</span></div>
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Tenant ID:</span><span>{selectedOfficer.tenantId || 'N/A'}</span></div>
              </div>

              <div className="mt-6">
                <PrivacyNotice userRole={mockRole} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
