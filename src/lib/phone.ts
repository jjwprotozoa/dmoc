// src/lib/phone.ts
// Phone number helpers using libphonenumber-js for validation and formatting

import { AsYouType, parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

export function formatAsYouTypeLocal(input: string, countryIso2?: string) {
  try {
    const typer = new AsYouType(countryIso2 as any);
    return typer.input(input);
  } catch {
    return input;
  }
}

export function toE164(localDigits: string, countryCallingCode?: string) {
  const digits = localDigits.replace(/\D/g, '');
  const code = (countryCallingCode || '').replace(/\D/g, '');
  if (!digits) return '';
  return code ? `+${code}${digits}` : digits;
}

export function validateE164(e164: string) {
  try {
    return isValidPhoneNumber(e164);
  } catch {
    return false;
  }
}

export function parseInternational(e164: string) {
  try {
    const pn = parsePhoneNumberFromString(e164);
    if (!pn) return null;
    return {
      e164: pn.number as string,
      country: pn.country as string | undefined,
      countryCallingCode: pn.countryCallingCode as string,
      nationalNumber: pn.nationalNumber as string,
      formattedInternational: pn.formatInternational(),
      formattedNational: pn.formatNational(),
    };
  } catch {
    return null;
  }
}
