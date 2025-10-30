// src/components/ui/sensitive-data-field.tsx
'use client';

import { Lock, Phone, Unlock } from 'lucide-react';
import { PrivacyConfig } from '../../lib/privacy';

interface SensitiveDataFieldProps {
  label: string;
  value: string;
  type: 'contact' | 'id' | 'email' | 'address';
  config: PrivacyConfig;
  itemId?: number;
  onUnlock?: (itemId: number) => void;
  onCall?: (value: string) => void;
  className?: string;
}

export function SensitiveDataField({
  label,
  value,
  type,
  config,
  itemId,
  onUnlock,
  onCall,
  className = '',
}: SensitiveDataFieldProps) {
  const isUnlocked = itemId ? config.unlockedItems?.has(itemId) : false;

  const getMaskedData = () => {
    switch (type) {
      case 'contact':
        return {
          display:
            config.canViewSensitive || isUnlocked
              ? value
              : value.length <= 7
                ? '*'.repeat(value.length)
                : `${value.substring(0, 3)}${'*'.repeat(value.length - 7)}${value.substring(value.length - 4)}`,
          masked: !config.canViewSensitive && !isUnlocked,
          link:
            config.canViewSensitive || isUnlocked ? `tel:${value}` : undefined,
        };
      case 'id':
        return {
          display:
            config.canViewSensitive || isUnlocked
              ? value
              : value.length <= 4
                ? '*'.repeat(value.length)
                : `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`,
          masked: !config.canViewSensitive && !isUnlocked,
        };
      case 'email':
        return {
          display:
            config.canViewSensitive || isUnlocked
              ? value
              : (() => {
                  const [local, domain] = value.split('@');
                  return local.length <= 2
                    ? '*'.repeat(local.length) + '@' + domain
                    : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
                })(),
          masked: !config.canViewSensitive && !isUnlocked,
          link:
            config.canViewSensitive || isUnlocked
              ? `mailto:${value}`
              : undefined,
        };
      case 'address':
        return {
          display:
            config.canViewSensitive || isUnlocked
              ? value
              : value.split(',').length <= 1
                ? '*'.repeat(Math.min(value.length, 10))
                : (() => {
                    const parts = value.split(',');
                    const lastPart = parts[parts.length - 1].trim();
                    const maskedParts = parts
                      .slice(0, -1)
                      .map((part) =>
                        '*'.repeat(Math.min(part.trim().length, 8))
                      );
                    return [...maskedParts, lastPart].join(', ');
                  })(),
          masked: !config.canViewSensitive && !isUnlocked,
        };
      default:
        return { display: value, masked: false };
    }
  };

  const maskedData = getMaskedData();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs ${className}`}>
      <span className="text-gray-500 whitespace-nowrap">{label}:</span>
      <div className="flex items-center space-x-1 mt-1 sm:mt-0 max-w-full">
        <span
          className={`text-gray-900 ${maskedData.masked ? 'font-mono' : ''} break-all max-w-full block leading-snug`}
        >
          {maskedData.display}
        </span>
        {type === 'contact' && maskedData.link && (
          <button
            onClick={() => onCall?.(value)}
            className="text-amber-600 hover:text-amber-700"
            title="Call"
          >
            <Phone className="w-3 h-3" />
          </button>
        )}
        {maskedData.masked && itemId && onUnlock && (
          <button
            onClick={() => onUnlock(itemId)}
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
  );
}
