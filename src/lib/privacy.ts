// src/lib/privacy.ts
/**
 * Privacy utility functions for POPIA compliance
 * Provides consistent data masking and access control across the application
 */

export interface PrivacyConfig {
  userRole: string;
  canViewSensitive: boolean;
  isAuthenticated?: boolean;
  unlockedItems?: Set<number>;
}

export interface MaskedData {
  display: string;
  masked: boolean;
  link?: string;
}

/**
 * Masks contact numbers based on user role and authentication status
 */
export function maskContactNumber(
  contactNumber: string, 
  config: PrivacyConfig, 
  itemId?: number
): MaskedData {
  if (!contactNumber || contactNumber.length === 0) {
    return { display: 'N/A', masked: false };
  }
  
  const isUnlocked = itemId ? config.unlockedItems?.has(itemId) : false;
  const masked = !config.canViewSensitive && !isUnlocked;
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
}

/**
 * Masks ID numbers based on user role and authentication status
 */
export function maskIdNumber(
  idNumber: string, 
  config: PrivacyConfig, 
  itemId?: number
): string {
  const isUnlocked = itemId ? config.unlockedItems?.has(itemId) : false;
  if (config.canViewSensitive || isUnlocked) return idNumber;
  if (idNumber.length <= 4) return '*'.repeat(idNumber.length);
  const firstTwo = idNumber.substring(0, 2);
  const lastTwo = idNumber.substring(idNumber.length - 2);
  const maskedMiddle = '*'.repeat(idNumber.length - 4);
  return `${firstTwo}${maskedMiddle}${lastTwo}`;
}

/**
 * Masks email addresses based on user role and authentication status
 */
export function maskEmail(
  email: string, 
  config: PrivacyConfig, 
  itemId?: number
): MaskedData {
  if (!email || email.length === 0) {
    return { display: 'N/A', masked: false };
  }
  
  const isUnlocked = itemId ? config.unlockedItems?.has(itemId) : false;
  const masked = !config.canViewSensitive && !isUnlocked;
  let display = email;
  let link = undefined;
  
  if (masked) {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      display = '*'.repeat(localPart.length) + '@' + domain;
    } else {
      const firstChar = localPart[0];
      const lastChar = localPart[localPart.length - 1];
      const maskedMiddle = '*'.repeat(localPart.length - 2);
      display = `${firstChar}${maskedMiddle}${lastChar}@${domain}`;
    }
  } else {
    link = `mailto:${email}`;
  }
  
  return { display, link, masked };
}

/**
 * Masks addresses based on user role and authentication status
 */
export function maskAddress(
  address: string, 
  config: PrivacyConfig, 
  itemId?: number
): string {
  if (!address || address.length === 0) {
    return 'No address';
  }
  
  const isUnlocked = itemId ? config.unlockedItems?.has(itemId) : false;
  if (config.canViewSensitive || isUnlocked) return address;
  
  // For addresses, show only city/country, mask street details
  const parts = address.split(',');
  if (parts.length <= 1) {
    return '*'.repeat(Math.min(address.length, 10));
  }
  
  // Show last part (usually city/country), mask the rest
  const lastPart = parts[parts.length - 1].trim();
  const maskedParts = parts.slice(0, -1).map(part => '*'.repeat(Math.min(part.trim().length, 8)));
  return [...maskedParts, lastPart].join(', ');
}

/**
 * Determines if user can view sensitive information
 */
export function canViewSensitive(userRole: string): boolean {
  return ['admin', 'manager'].includes(userRole.toLowerCase());
}

/**
 * Gets privacy notice text based on user role
 */
export function getPrivacyNotice(userRole: string): string {
  const canView = canViewSensitive(userRole);
  return canView 
    ? 'Full access to sensitive data'
    : 'Limited access - each item requires individual authentication';
}

/**
 * Privacy configuration hook for React components
 */
export function usePrivacyConfig(userRole: string, unlockedItems: Set<number> = new Set()) {
  return {
    userRole,
    canViewSensitive: canViewSensitive(userRole),
    unlockedItems,
    privacyNotice: getPrivacyNotice(userRole)
  };
}