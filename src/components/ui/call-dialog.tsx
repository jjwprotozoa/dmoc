// src/components/ui/call-dialog.tsx
'use client';

import { Phone, PhoneCall, PhoneOff, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './dialog';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverName: string;
  phoneNumber: string;
  maskedPhoneNumber?: string;
  onCall?: (phoneNumber: string) => void;
}

export function CallDialog({
  open,
  onOpenChange,
  driverName,
  phoneNumber,
  maskedPhoneNumber,
  onCall,
}: CallDialogProps) {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);

    // Simulate call initiation
    setTimeout(() => {
      // In a real app, this would integrate with telephony service
      if (onCall) {
        onCall(phoneNumber);
      }

      // Open native dialer
      window.open(`tel:${phoneNumber}`, '_self');

      setIsCalling(false);
      onOpenChange(false);
    }, 1000);
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting
    if (phone.length >= 10) {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-green-600" />
            <span>Call Driver</span>
          </DialogTitle>
          <DialogDescription>
            Initiate a call to the selected driver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{driverName}</h3>
                <p className="text-sm text-gray-600">Driver</p>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Calling:</p>
            <p className="text-2xl font-mono text-gray-900">
              {formatPhoneNumber(maskedPhoneNumber || phoneNumber)}
            </p>
            {maskedPhoneNumber && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>Privacy Notice:</strong> Number is masked.
                  Authentication required to view full number.
                </p>
              </div>
            )}
          </div>

          {/* Call Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCalling}
              className="flex items-center space-x-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button
              onClick={handleCall}
              disabled={isCalling}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isCalling ? (
                <>
                  <PhoneCall className="w-4 h-4 animate-pulse" />
                  <span>Calling...</span>
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
          <strong>Note:</strong> This will open your device&apos;s default
          calling app. Make sure you have sufficient credit or are connected to
          Wi-Fi for VoIP calls.
        </div>
      </DialogContent>
    </Dialog>
  );
}
