// src/app/(auth)/sign-in/page.tsx
'use client';

import { Lock, LogIn, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentialsFilled, setCredentialsFilled] = useState<'admin' | 'driver' | false>(false);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('📧 Email changed to:', email);
  }, [email]);

  useEffect(() => {
    console.log('🔑 Password changed to:', password);
  }, [password]);

  const fillDemoCredentials = () => {
    console.log('🔐 Filling demo credentials...');
    console.log('📧 Current email:', email);
    console.log('🔑 Current password:', password);
    
    setEmail('admin@digiwize.com');
    setPassword('admin123');
    setError(''); // Clear any existing errors
    setCredentialsFilled('admin');

    console.log('✅ Credentials set to admin@digiwize.com / admin123');

    // Reset the visual feedback after 2 seconds
    setTimeout(() => setCredentialsFilled(false), 2000);
  };

  const fillDriverCredentials = () => {
    console.log('🔐 Filling driver credentials...');
    console.log('📧 Current email:', email);
    console.log('🔑 Current password:', password);
    
    setEmail('driver@test.com');
    setPassword('driver123');
    setError(''); // Clear any existing errors
    setCredentialsFilled('driver');

    console.log('✅ Credentials set to driver@test.com / driver123');

    // Reset the visual feedback after 2 seconds
    setTimeout(() => setCredentialsFilled(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Redirect to post-login which handles role-based routing
        router.push('/post-login');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

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
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 mb-3">Demo credentials:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={(e) => {
                  console.log('🖱️ Admin button clicked!', e);
                  fillDemoCredentials();
                }}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all duration-200 w-full justify-center ${
                  credentialsFilled === 'admin'
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
              </button>
              <button
                type="button"
                onClick={(e) => {
                  console.log('🖱️ Driver button clicked!', e);
                  fillDriverCredentials();
                }}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all duration-200 w-full justify-center ${
                  credentialsFilled === 'driver'
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
              </button>
            </div>
            <p
              className={`text-xs mt-2 transition-colors duration-200 ${
                credentialsFilled ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {credentialsFilled
                ? '✓ Credentials filled!'
                : 'Click to auto-fill credentials'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
