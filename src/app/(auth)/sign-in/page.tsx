// src/app/(auth)/sign-in/page.tsx
// 2-step tenant-aware sign-in page
// Step 1: Identify user by email or username → lookup tenant info
// Step 2: Show tenant, optional client selector, password → sign in

'use client';

import { trpc } from '@/lib/trpc';
import { ArrowLeft, Building2, Lock, LogIn, Mail, User } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type TenantInfo = {
  id: string;
  slug: string;
  name: string | null;
};

type ClientInfo = {
  id: string;
  name: string;
  displayValue: string;
};

export default function SignInPage() {
  const [step, setStep] = useState<'identify' | 'password'>('identify');
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [clientId, setClientId] = useState<string | null | 'all'>(null);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentialsFilled, setCredentialsFilled] = useState<
    'admin' | 'driver' | false
  >(false);
  const router = useRouter();

  // Use React Query for the lookup
  const utils = trpc.useUtils();
  const lookupQuery = trpc.auth.lookupByEmailOrUsername.useQuery(
    { identifier },
    {
      enabled: false, // Don't auto-fetch, we'll trigger it manually
      retry: false,
    }
  );

  const handleIdentify = async (identifierToLookup?: string) => {
    const identifierValue = identifierToLookup ?? identifier;
    if (!identifierValue) {
      setError('Please enter an email address or username');
      return;
    }

    setError('');

    try {
      const data = await utils.auth.lookupByEmailOrUsername.fetch({
        identifier: identifierValue,
      });

      setTenant({
        id: data.tenantId,
        slug: data.tenantSlug ?? 'unknown',
        name: data.tenantName,
      });
      setClients(data.clients);

      // Auto-select if only one client
      if (data.clients.length === 1) {
        setClientId(data.clients[0].id);
      } else if (data.clients.length === 0) {
        setClientId(null);
      }

      setStep('password');
    } catch (e: any) {
      setError(e.message ?? 'Could not find user with that email or username');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!tenant) {
      setError('Please identify your account first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get the user's email from the lookup result (re-fetch to ensure we have latest data)
      const lookupData = await utils.auth.lookupByEmailOrUsername.fetch({
        identifier,
      });

      // Build credentials object - only include clientId if a specific client is selected
      const credentials: any = {
        email: lookupData.email, // Always use email for NextAuth
        password,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        redirect: false,
      };

      // Only add clientId if a specific client is selected (not "all")
      if (clientId && clientId !== 'all') {
        credentials.clientId = clientId;
      }

      const result = await signIn('credentials', credentials);

      if (result?.error) {
        // Check server console logs for more details
        // Common errors: invalid password, tenant mismatch, client access denied
        console.error('Sign-in error:', result.error);
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid password. Please check your password and try again.'
            : 'Authentication failed. Please try again.'
        );
      } else if (result?.ok) {
        router.push('/post-login');
        router.refresh();
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (e: any) {
      console.error('Sign-in exception:', e);
      setError(e.message ?? 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('identify');
    setPassword('');
    setError('');
    setTenant(null);
    setClientId(null);
    setClients([]);
  };

  const signInWithDemoCredentials = async (
    demoIdentifier: string,
    demoPassword: string,
    type: 'admin' | 'driver'
  ) => {
    setError('');
    setCredentialsFilled(type);
    setIsLoading(true);

    try {
      // Lookup user to get tenant and client info
      const lookupData = await utils.auth.lookupByEmailOrUsername.fetch({
        identifier: demoIdentifier,
      });

      // Set tenant info
      setTenant({
        id: lookupData.tenantId,
        slug: lookupData.tenantSlug ?? 'unknown',
        name: lookupData.tenantName,
      });

      // Set clients
      setClients(lookupData.clients);

      // Auto-select if only one client, otherwise default to "all" for multiple clients
      if (lookupData.clients.length === 1) {
        setClientId(lookupData.clients[0].id);
      } else if (lookupData.clients.length > 1) {
        // Default to "all" when user has multiple clients
        setClientId('all');
      } else if (lookupData.clients.length === 0) {
        setClientId(null);
      }

      // Build credentials object - only include clientId if it exists
      const credentials: any = {
        email: lookupData.email,
        password: demoPassword,
        tenantId: lookupData.tenantId,
        tenantSlug: lookupData.tenantSlug ?? 'unknown',
        redirect: false,
      };

      // Only add clientId if a specific client is selected (not "all")
      if (lookupData.clients.length === 1) {
        credentials.clientId = lookupData.clients[0].id;
      } else if (
        lookupData.clients.length > 1 &&
        clientId &&
        clientId !== 'all'
      ) {
        credentials.clientId = clientId;
      }

      // Sign in directly
      const result = await signIn('credentials', credentials);

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        setError('Authentication failed. Please check your credentials.');
        setCredentialsFilled(false);
      } else if (result?.ok) {
        router.push('/post-login');
        router.refresh();
        return; // Don't reset credentialsFilled on success
      } else {
        setError('Authentication failed. Please try again.');
        setCredentialsFilled(false);
      }
    } catch (e: any) {
      console.error('Sign-in exception:', e);
      setError(e.message ?? 'An error occurred. Please try again.');
      setCredentialsFilled(false);
    } finally {
      setIsLoading(false);
      // Reset the visual indicator after a delay
      setTimeout(() => setCredentialsFilled(false), 2000);
    }
  };

  const fillDemoCredentials = async () => {
    await signInWithDemoCredentials('admin@digiwize.com', 'admin123', 'admin');
  };

  const fillDriverCredentials = async () => {
    await signInWithDemoCredentials('driver@test.com', 'driver123', 'driver');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to LogisticsController
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure Transport & Manifest Management
          </p>
        </div>

        {step === 'identify' ? (
          <form
            className="mt-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleIdentify();
            }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="sr-only">
                Email address or username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {identifier.includes('@') ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={lookupQuery.isFetching}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={lookupQuery.isFetching}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lookupQuery.isFetching ? 'Looking up...' : 'Continue'}
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 mb-3">Quick sign-in:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isLoading || lookupQuery.isFetching}
                  className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all duration-200 w-full justify-center ${
                    credentialsFilled === 'admin'
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : isLoading
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Mail
                    className={`h-4 w-4 mr-2 ${credentialsFilled === 'admin' ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  admin@digiwize.com
                  <span className="mx-2 text-gray-400">/</span>
                  <Lock
                    className={`h-4 w-4 mr-2 ${credentialsFilled === 'admin' ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  admin123
                  {isLoading && credentialsFilled === 'admin' && (
                    <span className="ml-2 text-xs">Signing in...</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={fillDriverCredentials}
                  disabled={isLoading || lookupQuery.isFetching}
                  className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all duration-200 w-full justify-center ${
                    credentialsFilled === 'driver'
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : isLoading
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Mail
                    className={`h-4 w-4 mr-2 ${credentialsFilled === 'driver' ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  driver@test.com
                  <span className="mx-2 text-gray-400">/</span>
                  <Lock
                    className={`h-4 w-4 mr-2 ${credentialsFilled === 'driver' ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  driver123
                  {isLoading && credentialsFilled === 'driver' && (
                    <span className="ml-2 text-xs">Signing in...</span>
                  )}
                </button>
              </div>
              <p
                className={`text-xs mt-2 transition-colors duration-200 ${
                  credentialsFilled ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {credentialsFilled
                  ? '✓ Signing in...'
                  : 'Click to sign in directly'}
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Tenant Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wide">
                    Tenant
                  </p>
                  <p className="text-sm font-medium text-blue-900">
                    {tenant?.name ?? tenant?.slug ?? 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Client Selector (if multiple clients) */}
            {clients.length > 1 && (
              <div>
                <label
                  htmlFor="client"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Client/Company
                </label>
                <select
                  id="client"
                  name="client"
                  value={clientId === 'all' ? 'all' : (clientId ?? '')}
                  onChange={(e) => {
                    const value = e.target.value;
                    setClientId(value === 'all' ? 'all' : value || null);
                  }}
                  className="appearance-none rounded-md relative block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a client...</option>
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.displayValue || client.name}
                    </option>
                  ))}
                </select>
                {clientId === 'all' && (
                  <p className="mt-2 text-xs text-gray-600">
                    You will have access to view all clients/companies
                  </p>
                )}
              </div>
            )}

            {/* Auto-selected client info (if only one) */}
            {clients.length === 1 && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                  Client
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {clients[0].displayValue || clients[0].name}
                </p>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  (clients.length > 1 && !clientId && clientId !== 'all')
                }
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
