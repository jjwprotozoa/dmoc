// src/components/dashboard/ContactCardGrid.tsx
// Card grid view for contact directory; privacy-aware, CRUD-enabled, reuses POPIA auth and dialogs

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SensitiveDataField } from '@/components/ui/sensitive-data-field';
import { PrivacyNotice } from '@/components/ui/privacy-notice';
import { AuthDialog } from '@/components/ui/auth-dialog';
import { Button } from '@/components/ui/button';
import ContactFormDialog from './ContactFormDialog';
import countriesData from '@/data/countries.full.json';
import { User, CheckCircle, XCircle, Globe, Pencil, Trash2, Plus } from 'lucide-react';

export interface Contact {
  id: number;
  name: string;
  contactNr: string;
  idNumber: string;
  pictureLoaded: boolean;
  countryOfOrigin: string;
  dateTimeAdded: string;
  displayValue: string;
}

interface ContactCardGridProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onCreate?: (contact: Omit<Contact, 'id' | 'dateTimeAdded' | 'displayValue'>) => void;
}

export default function ContactCardGrid({ contacts, onEdit, onDelete, onCreate }: ContactCardGridProps) {
  // Role + POPIA state (same model as drivers page)
  const currentUserRole = 'operator'; // Mock role for parity with drivers page
  const canViewSensitive = ['admin', 'manager'].includes(currentUserRole);
  const [unlockedContacts, setUnlockedContacts] = useState<Set<number>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const privacyConfig = useMemo(
    () => ({ userRole: currentUserRole, canViewSensitive, unlockedItems: unlockedContacts }),
    [currentUserRole, canViewSensitive, unlockedContacts]
  );

  // Country name -> flag map (case-insensitive; supports common/official names)
  const countryNameToFlag = useMemo(() => {
    const map: Record<string, string> = {};
    const arr = Array.isArray(countriesData) ? countriesData : Object.values(countriesData as any);
    arr.forEach((c: any) => {
      const flag = c.flag || '';
      const common = c.name?.common?.toLowerCase?.();
      const official = c.name?.official?.toLowerCase?.();
      if (common) map[common] = flag;
      if (official) map[official] = flag;
    });
    return map;
  }, []);

  const getCountryFlag = (name?: string) => {
    if (!name) return '🌍';
    const key = name.toLowerCase();
    return countryNameToFlag[key] || '🌍';
  };

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // CRUD and privacy ops
  const handleEdit = (contact?: Contact) => {
    setEditContact(contact ?? null);
    setShowEdit(true);
  };
  const handleDelete = (contact: Contact) => {
    setDeleteContact(contact);
    setShowDelete(true);
  };
  const handleUnlockContact = (contactId: number) => {
    if (canViewSensitive) return setUnlockedContacts((prev) => new Set([...prev, contactId]));
    setPendingAction(() => () => setUnlockedContacts((prev) => new Set([...prev, contactId])));
    setShowAuthDialog(true);
  };
  const handleAuthenticated = () => {
    if (pendingAction) pendingAction();
    setPendingAction(null);
    setShowAuthDialog(false);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button variant="default" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id} className="flex flex-col h-full hover:shadow-lg">
            <CardContent className="flex flex-col items-start justify-between h-full p-5">
              <div className="flex w-full items-start justify-between">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  {contact.pictureLoaded ? (
                    <CheckCircle className="w-7 h-7 text-green-500" title="Picture Loaded" />
                  ) : (
                    <User className="w-7 h-7 text-gray-400" title="No Photo" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(contact)} title="Edit Contact">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(contact)} title="Delete Contact">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold truncate mb-1" onClick={() => setSelectedContact(contact)}>
                  {contact.displayValue}
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
                  <span className="text-base leading-none">{getCountryFlag(contact.countryOfOrigin)}</span>
                  <span>{contact.countryOfOrigin}</span>
                </div>
              </div>
              <SensitiveDataField
                label="Contact No."
                value={contact.contactNr}
                type="contact"
                config={privacyConfig as any}
                itemId={contact.id}
                onUnlock={handleUnlockContact}
              />
              <SensitiveDataField
                label="ID Number"
                value={contact.idNumber}
                type="id"
                config={privacyConfig as any}
                itemId={contact.id}
                onUnlock={handleUnlockContact}
                className="mt-0.5"
              />
              <span className="block mt-3 text-xs text-gray-400">Added: {contact.dateTimeAdded}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details/Modal */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedContact.displayValue}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mb-4">
                  <span className="flex items-center gap-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    <span className="text-base leading-none">{getCountryFlag(selectedContact.countryOfOrigin)}</span>
                    <span>{selectedContact.countryOfOrigin}</span>
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {selectedContact.pictureLoaded ? 'Picture Loaded' : 'No Photo'}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 mx-auto">
                {selectedContact.pictureLoaded ? (
                  <CheckCircle className="w-11 h-11 text-green-500" title="Picture Loaded" />
                ) : (
                  <XCircle className="w-11 h-11 text-gray-400" title="No Photo" />
                )}
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Contact ID:</span><span>{selectedContact.id}</span></div>
                <SensitiveDataField
                  label="Contact No."
                  value={selectedContact.contactNr}
                  type="contact"
                  config={privacyConfig as any}
                  itemId={selectedContact.id}
                  onUnlock={handleUnlockContact}
                  className="mt-0.5"
                />
                <SensitiveDataField
                  label="ID Number"
                  value={selectedContact.idNumber}
                  type="id"
                  config={privacyConfig as any}
                  itemId={selectedContact.id}
                  onUnlock={handleUnlockContact}
                  className="mt-0.5"
                />
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium w-28">Country:</span>
                  <span className="text-base leading-none">{getCountryFlag(selectedContact.countryOfOrigin)}</span>
                  <span>{selectedContact.countryOfOrigin}</span>
                </div>
                <div className="flex text-sm text-gray-700"><span className="font-medium w-28">Added:</span><span>{selectedContact.dateTimeAdded}</span></div>
              </div>
              <div className="mt-6">
                <PrivacyNotice userRole={currentUserRole} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete contact <b>{deleteContact?.displayValue}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setShowDelete(false); if (deleteContact && onDelete) onDelete(deleteContact); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialogs */}
      <ContactFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSave={(payload) => {
          if (onCreate) onCreate(payload);
        }}
      />
      <ContactFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        initial={editContact || undefined}
        onSave={(payload) => {
          if (editContact && onEdit) onEdit({ ...editContact, ...payload } as Contact);
        }}
      />

      {/* POPIA Auth Unlock Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
        title="Sensitive Data Unlock"
        description="Authenticate to unlock sensitive information for this contact."
      />
    </>
  );
}
