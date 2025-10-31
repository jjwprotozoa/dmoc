// src/app/dashboard/locations/page.tsx
// Locations main page: Manage pickup, delivery, and operational locations
'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { MapPin, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function LocationsPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deleteLocation, setDeleteLocation] = useState<any>(null);

  // Fetch locations with search from tRPC
  const { data, isLoading, error, refetch } = trpc.locations.list.useQuery({
    search: search || undefined,
    take: 100,
    skip: 0,
  });

  const utils = trpc.useUtils();

  // Create mutation
  const createMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      utils.locations.list.invalidate();
      setShowCreate(false);
    },
    onError: (error) => {
      console.error('Failed to create location:', error);
    },
  });

  // Update mutation
  const updateMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      utils.locations.list.invalidate();
      setEditingLocation(null);
    },
    onError: (error) => {
      console.error('Failed to update location:', error);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      utils.locations.list.invalidate();
      setDeleteLocation(null);
    },
    onError: (error) => {
      console.error('Failed to delete location:', error);
    },
  });

  const locations = data?.items || [];

  const handleCreate = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (formData: any) => {
    updateMutation.mutate({ id: editingLocation.id, ...formData });
  };

  const handleDelete = () => {
    if (deleteLocation) {
      deleteMutation.mutate({ id: deleteLocation.id });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <MapPin className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <MapPin className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load locations</p>
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
          <MapPin className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        </div>
        <div className="md:ml-auto flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No locations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{location.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingLocation(location)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteLocation(location)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                {location.description && (
                  <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                )}
                {location.address && (
                  <p className="text-sm text-gray-500 mb-2">{location.address}</p>
                )}
                {(location.latitude !== null && location.longitude !== null) && (
                  <p className="text-xs text-gray-400">
                    📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <LocationFormDialog
        open={showCreate || !!editingLocation}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditingLocation(null);
          }
        }}
        initial={editingLocation}
        onSave={editingLocation ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteLocation} onOpenChange={() => setDeleteLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete location <b>{deleteLocation?.name}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteLocation(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LocationFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: any;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name,
      description: form.description || undefined,
      address: form.address || undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
    });
    setForm({ name: '', description: '', address: '', latitude: '', longitude: '' });
  };

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        address: initial.address || '',
        latitude: initial.latitude?.toString() || '',
        longitude: initial.longitude?.toString() || '',
      });
    } else {
      setForm({ name: '', description: '', address: '', latitude: '', longitude: '' });
    }
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Location' : 'Add Location'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Update location details' : 'Create a new operational location'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name *</label>
            <Input
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Location name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <Input
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Location description"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Address</label>
            <Input
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Latitude</label>
              <Input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateForm('latitude', e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Longitude</label>
              <Input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateForm('longitude', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{initial ? 'Save Changes' : 'Create Location'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
