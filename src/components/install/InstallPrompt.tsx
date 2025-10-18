// src/components/install/InstallPrompt.tsx
'use client';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 md:p-4 mb-4 sm:mb-6 overflow-x-hidden max-w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-blue-900 truncate">
              Install LogisticsController
            </h3>
            <p className="text-xs sm:text-sm text-blue-700 truncate">
              Install this app for quick access and offline functionality.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="bg-blue-600 text-white px-2 py-1 sm:px-3 rounded text-xs sm:text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 flex-shrink-0"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
