'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import countriesData from '@/data/countries.full.json';
import { trpc } from '@/lib/trpc';
import { Flag, Globe, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const initialForm = { name: '', abbreviation: '', flag: '', displayValue: '' };

// Map official country data to options for dropdown
const countryOptions = (
  Array.isArray(countriesData) ? countriesData : Object.values(countriesData)
)
  .map((c: any) => ({
    name: c.name.common,
    abbreviation: c.cca2,
    flag: c.flag,
    displayValue: c.name.official,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function CountriesPage() {
  const utils = trpc.useUtils();
  const { data: countries, isLoading, error } = trpc.countries.list.useQuery();
  // Modal state & selected country
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  // Form state
  const [form, setForm] = useState(initialForm);
  const [formErr, setFormErr] = useState('');
  // Add mutation
  const create = trpc.countries.create.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      setFormErr('');
      utils.countries.list.invalidate();
    },
    onError: (err) => setFormErr(err.message),
  });
  const del = trpc.countries.delete.useMutation({
    onSuccess: () => {
      setShowDelete(false);
      setFormErr('');
      utils.countries.list.invalidate();
    },
    onError: (err) => setFormErr(err.message),
  });

  // Modal handlers
  const handleDelete = (country: any) => {
    setSelected(country);
    setShowDelete(true);
    setFormErr('');
  };
  const handleAdd = () => {
    setSelected(null);
    setShowAdd(true);
    setForm(initialForm);
    setFormErr('');
  };

  // Form logic
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setFormErr('');
    if (!form.name || !form.abbreviation || !form.displayValue) {
      setFormErr('Name, abbreviation, and displayValue are required');
      return;
    }
    // Ensure flag is undefined if empty to pass zod validation
    const payload = { ...form, flag: form.flag?.trim() || undefined };
    create.mutate(payload);
  };
  const handleDeleteConfirm = () => {
    if (selected) del.mutate({ id: selected.id });
  };
  // ---
  return (
    <div className="p-6 relative">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Globe className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
        </div>
        <p className="text-gray-600">
          Manage international operations and country-specific settings
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Flag className="w-6 h-6 text-amber-600 mr-2" />
          Country List
        </h2>
        {isLoading && <div className="text-gray-500">Loading countries...</div>}
        {error && (
          <div className="text-red-500">Failed to load country list</div>
        )}
        {countries && (
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {countries.map((c: any) => (
                <div
                  key={c.id}
                  className="bg-gray-50 border flex flex-col items-center p-4 rounded-lg shadow group hover:border-amber-500 transition w-full"
                >
                  <span className="text-4xl mb-1">{c.flag || '🌍'}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`font-bold text-center min-h-[3rem] max-w-full px-2 break-normal whitespace-normal line-clamp-2 ${
                          c.name.length > 12 ? 'text-sm' : 'text-base'
                        } text-gray-900`}
                      >
                        {c.name}
                      </div>
                    </TooltipTrigger>
                    {c.name.length > 15 && (
                      <TooltipContent>
                        <p>{c.name}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <div className="text-xs text-gray-500 mb-2">
                    {c.abbreviation}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
      {/* Floating Add Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="fixed z-50 bottom-20 lg:bottom-6 right-6 flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white rounded-full w-16 h-16 shadow-lg focus:outline-none"
              onClick={handleAdd}
              aria-label="Add Country"
            >
              <Plus className="w-8 h-8" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Country</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-sm"
          >
            <div className="font-bold mb-2">Add Country</div>
            <div className="flex flex-col gap-3">
              {/* Country dropdown */}
              <label className="text-sm">
                Country
                <Select
                  onValueChange={(val) => {
                    const matched = countryOptions.find(
                      (o) => o.abbreviation === val
                    );
                    if (matched) setForm(matched);
                  }}
                  value={form.abbreviation || ''}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countryOptions.map((option) => (
                      <SelectItem
                        value={option.abbreviation}
                        key={option.abbreviation}
                      >
                        <span className="mr-2">{option.flag}</span>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="text-sm">
                Name
                <input
                  name="name"
                  value={form.name}
                  required
                  minLength={2}
                  readOnly
                  className="mt-1 input input-bordered w-full bg-gray-100 cursor-not-allowed"
                />
              </label>
              <label className="text-sm">
                Abbreviation
                <input
                  name="abbreviation"
                  value={form.abbreviation}
                  required
                  minLength={2}
                  maxLength={4}
                  readOnly
                  className="mt-1 input input-bordered w-full bg-gray-100 cursor-not-allowed"
                />
              </label>
              <label className="text-sm">
                Flag (Emoji)
                <input
                  name="flag"
                  value={form.flag}
                  readOnly
                  className="mt-1 input input-bordered w-full bg-gray-100 cursor-not-allowed"
                />
              </label>
              {/* Hidden displayValue - required by schema but redundant in UI */}
              <input
                type="hidden"
                name="displayValue"
                value={form.displayValue}
              />
            </div>
            {formErr && (
              <div className="text-red-600 text-xs mt-2">{formErr}</div>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setShowAdd(false);
                }}
                disabled={create.isLoading}
              >
                Cancel
              </button>
              <button
                className="btn bg-amber-600 text-white hover:bg-amber-700"
                type="submit"
                disabled={create.isLoading}
              >
                {create.isLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="font-bold mb-2">Delete Country</div>
            <div className="mb-4">
              Are you sure you want to delete <b>{selected?.name}</b>?
            </div>
            {formErr && (
              <div className="text-red-600 text-xs mb-2">{formErr}</div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                className="btn"
                onClick={() => setShowDelete(false)}
                disabled={del.isLoading}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteConfirm}
                disabled={del.isLoading}
              >
                {del.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
