// src/app/dashboard/contacts/page.tsx
// Contacts main page: Card-based, filterable, privacy-aware display/grid, uses ContactCardGrid
'use client';

import ContactCardGrid, { Contact } from '@/components/dashboard/ContactCardGrid';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactsPage() {
  const [search, setSearch] = useState('');

  // Fetch contacts with search from tRPC
  const { data, isLoading, error, refetch } = trpc.contacts.list.useQuery({
    search: search || undefined,
    take: 100, // Get all contacts for now (can add pagination later)
    skip: 0,
  });

  const utils = trpc.useUtils();

  // Create mutation
  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create contact:', error);
    },
  });

  // Update mutation
  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to update contact:', error);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to delete contact:', error);
    },
  });

  // Contacts are already filtered server-side
  const contacts = data?.items || [];

  const handleCreate = (payload: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'displayValue'>) => {
    createMutation.mutate({
      name: payload.name,
      contactNr: payload.contactNr,
      idNumber: payload.idNumber,
      pictureLoaded: payload.pictureLoaded,
      countryOfOrigin: payload.countryOfOrigin,
      displayValue: payload.name, // Default to name if not provided
    });
  };

  const handleEdit = (updated: Contact) => {
    updateMutation.mutate({
      id: updated.id,
      name: updated.name,
      contactNr: updated.contactNr,
      idNumber: updated.idNumber,
      pictureLoaded: updated.pictureLoaded,
      countryOfOrigin: updated.countryOfOrigin,
      displayValue: updated.name, // Use name as displayValue if not explicitly set
    });
  };

  const handleDelete = (toDelete: Contact) => {
    deleteMutation.mutate({ id: toDelete.id });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Phone className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Phone className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load contacts</p>
            <p className="text-sm text-gray-500">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        contacts={contacts}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
