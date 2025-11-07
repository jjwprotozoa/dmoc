// src/app/dashboard/admin/users/page.tsx
// Admin user management page for Digiwize platform administrators
// Allows managing all users across tenants (view, create, edit, deactivate)

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Plus,
  Trash2,
  Shield,
  User as UserIcon,
  X,
  Check,
  RefreshCw,
  Eye,
  Upload,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  roleName: string;
  isActive: boolean;
  profileId: string;
  profileName: string;
  tenantSlug: string;
  companies: Array<{ id: string; companyId: number; name: string; displayValue: string }>;
}

interface UserFormData {
  username: string;
  email?: string;
  name?: string;
  roleId: string;
  profileId: string;
  clientIds: string[];
  isActive: boolean;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    name: '',
    roleId: 'VIEWER', // Default to VIEWER to match legacy system
    profileId: '',
    clientIds: [],
    isActive: true,
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Filter and sort state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'username' | 'role' | 'profile'>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/sign-in');
      return;
    }

    const user = session.user;
    const tenantSlug = user.tenantSlug?.toLowerCase();
    const role = user.role?.toUpperCase();

    const isDigiwizeTenant = tenantSlug === 'digiwize';
    const isAdminRole = ['ADMIN', 'SUPER_ADMIN', 'DIGIWIZE_ADMIN'].includes(role || '');

    if (!isDigiwizeTenant && !isAdminRole) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [session, status, router]);

  // Fetch data
  const { data: users, isLoading, error, refetch } = trpc.adminUsers.list.useQuery(
    undefined,
    {
      enabled: isAuthorized === true,
      retry: false,
    }
  );

  const { data: tenants } = trpc.adminUsers.getTenants.useQuery(undefined, {
    enabled: isAuthorized === true,
  });

  const { data: roles } = trpc.adminUsers.getRoles.useQuery(undefined, {
    enabled: isAuthorized === true,
  });

  // Get all clients (companies are shared across tenants for Digiwize admins)
  const { data: clients } = trpc.adminUsers.getClients.useQuery(
    {},
    {
      enabled: isAuthorized === true,
    }
  );

  const { data: userDetails, refetch: refetchUserDetails } = trpc.adminUsers.getUserDetails.useQuery(
    { userId: selectedUserId || '' },
    {
      enabled: isAuthorized === true && selectedUserId !== null,
    }
  );

  const utils = trpc.useUtils();
  
  const createUser = trpc.adminUsers.create.useMutation({
    onSuccess: () => {
      setIsCreateModalOpen(false);
      resetForm();
      utils.adminUsers.list.invalidate();
      refetch();
    },
  });

  const updateUser = trpc.adminUsers.update.useMutation({
    onSuccess: () => {
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
      utils.adminUsers.list.invalidate();
      refetch();
    },
  });

  const deactivateUser = trpc.adminUsers.deactivate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetPassword = trpc.adminUsers.resetPassword.useMutation({
    onSuccess: (data) => {
      if (data.temporaryPassword) {
        alert(`Password reset! Temporary password: ${data.temporaryPassword}`);
      }
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      roleId: 'VIEWER',
      profileId: '',
      clientIds: [],
      isActive: true,
    });
  };

  const handleCreate = () => {
    createUser.mutate({
      username: formData.username,
      email: formData.email,
      name: formData.name,
      roleId: formData.roleId,
      profileId: formData.profileId,
      clientIds: formData.clientIds,
      isActive: formData.isActive,
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      name: user.name || '',
      roleId: user.roleName,
      profileId: user.profileId,
      clientIds: user.companies.map((c) => c.id),
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedUser) return;

      updateUser.mutate({
        id: selectedUser.id,
        email: formData.email,
        name: formData.name,
        roleId: formData.roleId,
        profileId: formData.profileId,
        clientIds: formData.clientIds,
        isActive: formData.isActive,
      });
  };

  const handleDeactivate = (userId: string) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      deactivateUser.mutate({ id: userId });
    }
  };

  const handleResetPassword = (userId: string) => {
    if (confirm('Reset password for this user? A temporary password will be generated.')) {
      resetPassword.mutate({ id: userId });
    }
  };

  const toggleClient = (clientId: string) => {
    setFormData((prev) => ({
      ...prev,
      clientIds: prev.clientIds.includes(clientId)
        ? prev.clientIds.filter((id) => id !== clientId)
        : [...prev.clientIds, clientId],
    }));
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = [...users];

    // Apply filters
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.roleName === roleFilter);
    }

    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    if (profileFilter !== 'all') {
      filtered = filtered.filter((user) => user.profileId === profileFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'username':
          comparison = (a.username || '').localeCompare(b.username || '');
          break;
        case 'role':
          comparison = (a.roleName || '').localeCompare(b.roleName || '');
          break;
        case 'profile':
          comparison = (a.profileName || '').localeCompare(b.profileName || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, roleFilter, activeFilter, profileFilter, sortBy, sortDirection]);

  const handleSort = (field: 'username' | 'role' | 'profile') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setRoleFilter('all');
    setActiveFilter('all');
    setProfileFilter('all');
  };

  const hasActiveFilters = roleFilter !== 'all' || activeFilter !== 'all' || profileFilter !== 'all';

  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Authorized</h3>
              <p className="text-gray-600">
                This page is only accessible to Digiwize administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage all users across tenants (Digiwize Admin Only)
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="role-filter" className="text-xs text-gray-500 mb-1 block">
                Role
              </Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter" className="h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="active-filter" className="text-xs text-gray-500 mb-1 block">
                Status
              </Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger id="active-filter" className="h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="profile-filter" className="text-xs text-gray-500 mb-1 block">
                Profile
              </Label>
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger id="profile-filter" className="h-9">
                  <SelectValue placeholder="All Profiles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <UserIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Error loading users</p>
              <p className="text-sm text-gray-500 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure users have been seeded. Run: npm run db:seed:users
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('username')}
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                      >
                        Username
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                      >
                        Role
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">Active</th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('profile')}
                        className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                      >
                        Profile
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No users found matching the selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{user.username}</td>
                      <td className="p-3">
                        <Badge variant="outline">{user.roleName}</Badge>
                      </td>
                      <td className="p-3">
                        {user.isActive ? (
                          <span className="text-green-600">✅</span>
                        ) : (
                          <span className="text-red-600">❌</span>
                        )}
                      </td>
                      <td className="p-3">{user.profileName}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(user.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                            title="Reset Password"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(user.id)}
                            title="Deactivate User"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredAndSortedUsers.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredAndSortedUsers.length} of {users?.length || 0} users
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. A temporary password will be generated if not provided.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-username">Username *</Label>
              <Input
                id="create-username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="MUWEMA EUGINE or user@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Can be a plain username or email address
              </p>
            </div>
            <div>
              <Label htmlFor="create-email">Email (Optional)</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                If not provided, will use username or generate from username
              </p>
            </div>
            <div>
              <Label htmlFor="create-name">Full Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="create-role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roleId: value }))
                }
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-tenant">Tenant/Profile *</Label>
              <Select
                value={formData.profileId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, profileId: value }))
                }
              >
                <SelectTrigger id="create-tenant">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {clients && clients.length > 0 && (
              <div>
                <Label>Companies (Client Access)</Label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${client.id}`}
                        checked={formData.clientIds.includes(client.id)}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <Label 
                        htmlFor={`client-${client.id}`}
                        className="font-normal cursor-pointer flex-1"
                      >
                        {client.displayValue || client.name} (ID: {client.companyId})
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.clientIds.length} of {clients.length} companies selected
                </p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked === true }))
                }
              />
              <Label htmlFor="create-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.username || !formData.roleId || !formData.profileId}
              >
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Username cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username (Email)</Label>
              <Input value={formData.username} disabled />
            </div>
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roleId: value }))
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-tenant">Tenant/Profile</Label>
              <Select
                value={formData.profileId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, profileId: value }))
                }
              >
                <SelectTrigger id="edit-tenant">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {clients && clients.length > 0 && (
              <div>
                <Label>Companies (Client Access)</Label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${client.id}`}
                        checked={formData.clientIds.includes(client.id)}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <Label 
                        htmlFor={`client-${client.id}`}
                        className="font-normal cursor-pointer flex-1"
                      >
                        {client.displayValue || client.name} (ID: {client.companyId})
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.clientIds.length} of {clients.length} companies selected
                </p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked === true }))
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateUser.isLoading}>
                {updateUser.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user information, images, and company access
            </DialogDescription>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Username</Label>
                  <p className="text-sm text-gray-700">{userDetails.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="text-sm text-gray-700">{userDetails.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Role</Label>
                  <Badge variant="outline">{userDetails.role}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Profile</Label>
                  <p className="text-sm text-gray-700">{userDetails.profileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <p className="text-sm">
                    {userDetails.isActive ? (
                      <span className="text-green-600">✅ Active</span>
                    ) : (
                      <span className="text-red-600">❌ Inactive</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Role Permissions */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Role Permissions</Label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {userDetails.role === 'DIGIWIZE_ADMIN' && 'Platform superuser — can view all tenants, manage users'}
                    {userDetails.role === 'ADMINISTRATOR' && 'Full tenant-level access (can manage drivers, manifests, locations, etc.)'}
                    {userDetails.role === 'MANAGER' && 'Mid-level admin, can review manifests, assign drivers, and see tenant data'}
                    {userDetails.role === 'CONTROLLER' && 'Operational role for dispatching, tracking, manifest logging, etc.'}
                    {userDetails.role === 'VIEWER' && 'Read-only access to dashboards or manifests'}
                    {userDetails.role === 'ACCOUNTS' && 'Limited to financial or client-billing features (specific tenant)'}
                    {userDetails.role === 'DRIVER' && 'Limited to assigned trips'}
                  </p>
                </div>
              </div>

              {/* Company Access */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Company Access ({userDetails.companies.length} of {clients?.length || 0} selected)
                </Label>
                {clients && clients.length > 0 ? (
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                    {clients.map((client) => {
                      const isSelected = userDetails.companies.some((c) => c.id === client.id);
                      return (
                        <div key={client.id} className="flex items-center space-x-2">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                            {client.displayValue || client.name} (ID: {client.companyId})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No companies available</p>
                )}
              </div>

              {/* Images Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">Images</Label>
                  <div className="flex space-x-2">
                    <UserImageUpload userId={userDetails.id} type="photo" onUpload={refetchUserDetails} />
                    <UserImageUpload userId={userDetails.id} type="id" onUpload={refetchUserDetails} />
                    <UserImageUpload userId={userDetails.id} type="passport" onUpload={refetchUserDetails} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {userDetails.images
                    .filter((img) => img.type === 'photo')
                    .map((img) => (
                      <UserImageDisplay key={img.id} image={img} onDelete={refetchUserDetails} />
                    ))}
                  {userDetails.images
                    .filter((img) => img.type === 'id')
                    .map((img) => (
                      <UserImageDisplay key={img.id} image={img} onDelete={refetchUserDetails} />
                    ))}
                  {userDetails.images
                    .filter((img) => img.type === 'passport')
                    .map((img) => (
                      <UserImageDisplay key={img.id} image={img} onDelete={refetchUserDetails} />
                    ))}
                </div>
                {userDetails.images.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No images uploaded yet
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// User Image Upload Component
function UserImageUpload({
  userId,
  type,
  onUpload,
}: {
  userId: string;
  type: 'photo' | 'id' | 'passport';
  onUpload: () => void;
}) {
  const utils = trpc.useUtils();
  const getSigned = trpc.adminUsers.getSignedImageUpload.useMutation();
  const uploadImage = trpc.adminUsers.uploadImage.useMutation({
    onSuccess: () => {
      utils.adminUsers.getUserDetails.invalidate({ userId });
      onUpload();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Get signed URL
      const signed = await getSigned.mutateAsync({
        userId,
        type,
        filename: file.name,
        contentType: file.type,
      });

      // Upload to S3
      await fetch(signed.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Save to database
      await uploadImage.mutateAsync({
        userId,
        type,
        uri: signed.publicUri,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    }
  };

  const labels = {
    photo: 'Photo',
    id: 'ID',
    passport: 'Passport',
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={getSigned.isLoading || uploadImage.isLoading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={getSigned.isLoading || uploadImage.isLoading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {getSigned.isLoading || uploadImage.isLoading ? 'Uploading...' : `Upload ${labels[type]}`}
      </Button>
    </label>
  );
}

// User Image Display Component
function UserImageDisplay({
  image,
  onDelete,
}: {
  image: { id: string; type: string; uri: string; mimeType?: string | null };
  onDelete: () => void;
}) {
  const utils = trpc.useUtils();
  const deleteImage = trpc.adminUsers.deleteImage.useMutation({
    onSuccess: () => {
      utils.adminUsers.getUserDetails.invalidate();
      onDelete();
    },
  });

  const labels = {
    photo: 'Photo',
    id: 'ID',
    passport: 'Passport',
  };

  return (
    <div className="relative group">
      <img
        src={image.uri}
        alt={labels[image.type as keyof typeof labels] || 'Image'}
        className="w-full h-32 object-cover rounded-lg border"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.png';
        }}
      />
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          if (confirm('Delete this image?')) {
            deleteImage.mutate({ imageId: image.id });
          }
        }}
      >
        <X className="w-4 h-4" />
      </Button>
      <div className="absolute bottom-2 left-2">
        <Badge variant="secondary" className="text-xs">
          {labels[image.type as keyof typeof labels] || image.type}
        </Badge>
      </div>
    </div>
  );
}

