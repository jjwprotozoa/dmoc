// src/app/dashboard/contacts/page.tsx
// Contacts main page: Card-based, filterable, privacy-aware display/grid, uses ContactCardGrid
'use client';

import { useMemo, useState } from 'react';
import ContactCardGrid, { Contact } from '@/components/dashboard/ContactCardGrid';
import { Input } from '@/components/ui/input';
import { Phone } from 'lucide-react';

const seedContacts: Contact[] = [
  {
    name: 'CALLUM WRIGHT(TBA)',
    contactNr: '260964605805',
    idNumber: '46eb48ae-7384-4f8f-9da3-cd9d2cab1db5',
    pictureLoaded: true,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '2/21/2023 12:12 AM',
    id: 10479,
    displayValue: 'CALLUM WRIGHT(TBA)',
  },
  {
    name: 'DIRK(TBA)',
    contactNr: '27662035369',
    idNumber: '7901175105081',
    pictureLoaded: true,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '2/16/2023 3:22 PM',
    id: 10330,
    displayValue: 'DIRK(TBA)',
  },
  {
    name: 'INSP. SINYANGWE(TBA)',
    contactNr: '0969937640',
    idNumber: '11',
    pictureLoaded: false,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '4/15/2023 4:49 AM',
    id: 12341,
    displayValue: 'INSP. SINYANGWE(TBA)',
  },
  {
    name: 'KEITH TRYTSMAN(TBA)',
    contactNr: '260969768654',
    idNumber: '283b9f73-1a2d-4122-b3b7-5680daee01e7',
    pictureLoaded: true,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '2/21/2023 12:11 AM',
    id: 10478,
    displayValue: 'KEITH TRYTSMAN(TBA)',
  },
  {
    name: 'PANDE GEOFFREY(TBA)',
    contactNr: '0971579391',
    idNumber: '338286641',
    pictureLoaded: false,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '5/25/2023 7:21 AM',
    id: 13194,
    displayValue: 'PANDE GEOFFREY(TBA)',
  },
  {
    name: 'VAN HELSINK(TBA)',
    contactNr: '22',
    idNumber: '12233445567',
    pictureLoaded: false,
    countryOfOrigin: 'UNKNOWN',
    dateTimeAdded: '3/27/2023 9:13 PM',
    id: 11833,
    displayValue: 'VAN HELSINK(TBA)',
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(seedContacts);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.contactNr.includes(search) ||
          c.idNumber.toLowerCase().includes(search.toLowerCase()) ||
          c.countryOfOrigin.toLowerCase().includes(search.toLowerCase())
      ),
    [contacts, search]
  );

  const handleCreate = (payload: Omit<Contact, 'id' | 'dateTimeAdded' | 'displayValue'>) => {
    const now = new Date();
    const fmt = now.toLocaleString('en-US', { hour12: true });
    const nextId = Math.max(0, ...contacts.map((c) => c.id)) + 1;
    const newContact: Contact = {
      id: nextId,
      dateTimeAdded: fmt,
      displayValue: payload.name,
      ...payload,
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleEdit = (updated: Contact) => {
    updated.displayValue = updated.name;
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? { ...updated } : c)));
  };

  const handleDelete = (toDelete: Contact) => {
    setContacts((prev) => prev.filter((c) => c.id !== toDelete.id));
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
        <div className="flex items-center space-x-3">
          <Phone className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        </div>
        <div className="md:ml-auto w-full md:w-96">
          <Input
            placeholder="Search by name, contact number, ID, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 md:mt-0"
          />
        </div>
      </div>
      <ContactCardGrid
        contacts={filtered}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
