// src/components/dashboard/ContactFormDialog.tsx
// Reusable dialog for creating and editing contacts with validation

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import countriesData from '@/data/countries.full.json';
import { formatAsYouTypeLocal, toE164, validateE164 } from '@/lib/phone';
import type { Contact } from './ContactCardGrid';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Contact | null;
  onSave: (contact: Omit<Contact, 'id' | 'dateTimeAdded' | 'displayValue'> & Partial<Pick<Contact, 'id' | 'dateTimeAdded' | 'displayValue'>>) => void;
}

type ContactFormState = {
  name: string;
  contactNr: string;
  idNumber: string;
  pictureLoaded: boolean;
  countryOfOrigin: string;
};

const initialState: ContactFormState = {
  name: '',
  contactNr: '',
  idNumber: '',
  pictureLoaded: false,
  countryOfOrigin: 'UNKNOWN',
};

export default function ContactFormDialog({ open, onOpenChange, initial, onSave }: ContactFormDialogProps) {
  const [form, setForm] = useState<ContactFormState>({ ...initialState });
  const [error, setError] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneLocal, setPhoneLocal] = useState(''); // national digits without country code

  const countryOptions = useMemo(() => {
    const arr = Array.isArray(countriesData) ? countriesData : Object.values(countriesData as any);
    return arr
      .map((c: any) => ({
        name: c.name?.common || c.name,
        abbreviation: c.cca2 || c.code,
        flag: c.flag || '',
        displayValue: c.name?.official || c.name?.common || c.name,
        dialCode:
          (c.idd?.root || '') && Array.isArray(c.idd?.suffixes) && c.idd.suffixes.length > 0
            ? `${c.idd.root}${c.idd.suffixes[0]}`
            : (c.idd?.root || '') || '',
        iso2: (c.cca2 || '').toUpperCase(),
      }))
      .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
  }, []);

  const filteredCountryOptions = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countryOptions;
    return countryOptions.filter((opt: any) =>
      (opt.name || '').toLowerCase().includes(q) ||
      (opt.displayValue || '').toLowerCase().includes(q) ||
      (opt.abbreviation || '').toLowerCase().includes(q) ||
      (opt.dialCode || '').toLowerCase().includes(q)
    );
  }, [countryOptions, countrySearch]);

  const selectedCountry = useMemo(
    () => countryOptions.find((c: any) => c.name === form.countryOfOrigin),
    [countryOptions, form.countryOfOrigin]
  );

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        contactNr: initial.contactNr,
        idNumber: initial.idNumber,
        pictureLoaded: initial.pictureLoaded,
        countryOfOrigin: initial.countryOfOrigin || 'UNKNOWN',
      });
      // Split initial contactNr into code + local if possible
      const digits = (initial.contactNr || '').replace(/\D/g, '');
      const code = (selectedCountry?.dialCode || '').replace(/\D/g, '');
      if (digits.startsWith(code) && code.length > 0) setPhoneLocal(digits.slice(code.length));
      else setPhoneLocal(digits);
    } else {
      setForm({ ...initialState });
      setPhoneLocal('');
    }
    setError('');
    setCountrySearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const composedInternational = () => {
    const code = (selectedCountry?.dialCode || '').replace(/\D/g, '');
    const local = phoneLocal.replace(/\D/g, '');
    return toE164(local, code);
  };

  const onPhoneInput = (val: string) => {
    const iso2 = selectedCountry?.iso2 as string | undefined;
    // As-you-type formatting in national format for the selected country
    const formatted = iso2 ? formatAsYouTypeLocal(val, iso2) : val;
    setPhoneLocal(formatted);
  };

  const handleSubmit = () => {
    const e164 = composedInternational();
    if (!form.name.trim()) return setError('Name is required');
    if (!e164) return setError('Contact Number is required');
    if (!validateE164(e164)) return setError('Please enter a valid phone number for the selected country');
    if (!form.idNumber.trim()) return setError('ID Number is required');
    onSave({ ...initial, ...form, contactNr: e164 });
    onOpenChange(false);
  };

  const renderCountryTrigger = () => {
    const selected = selectedCountry;
    return (
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{selected?.flag || '🏳️'}</span>
        <span className="truncate">
          {selected ? `${selected.name} ${selected.dialCode ? `(${selected.dialCode})` : ''}` : form.countryOfOrigin || 'Select country'}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
          <DialogDescription>Maintain your contact directory. Fields with sensitive data comply with POPIA elsewhere when displayed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. JOHN DOE(TZ)" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Country of Origin</label>
            <Select value={form.countryOfOrigin} onValueChange={(v) => handleChange('countryOfOrigin', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country">{renderCountryTrigger()}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="sticky top-0 z-10 bg-popover p-2">
                  <Input
                    placeholder="Search country by name or code..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="h-8"
                  />
                </div>
                {filteredCountryOptions.map((opt: any) => (
                  <SelectItem key={opt.name} value={opt.name}>
                    <span className="flex items-center gap-2">
                      <span>{opt.flag}</span>
                      <span className="truncate">{opt.name}</span>
                      {opt.dialCode && (
                        <span className="ml-auto text-muted-foreground text-xs">{opt.dialCode}</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Contact Number</label>
            <div className="flex items-stretch gap-2">
              <div className="min-w-[90px] px-3 flex items-center justify-center rounded-md border text-sm bg-muted/30">
                {selectedCountry?.dialCode || '+–'}
              </div>
              <Input
                value={phoneLocal}
                onChange={(e) => onPhoneInput(e.target.value)}
                placeholder="Local number"
              />
            </div>
            <div className="mt-1 text-[11px] text-gray-500">Will save as {composedInternational() || '—'}</div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">ID Number</label>
            <Input value={form.idNumber} onChange={(e) => handleChange('idNumber', e.target.value)} placeholder="National ID / Passport" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="pictureLoaded" checked={form.pictureLoaded} onCheckedChange={(v) => handleChange('pictureLoaded', Boolean(v))} />
            <label htmlFor="pictureLoaded" className="text-sm text-gray-700">Picture Loaded</label>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{initial ? 'Save Changes' : 'Create Contact'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
