// test-prod-debug.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugProductionAuth() {
  console.log('🔍 Debugging production authentication...');
  
  const prodUrl = 'https://dmoc.vercel.app';
  
  try {
    // Test the auth providers endpoint to see what's configured
    console.log('\n📊 Checking auth providers...');
    const providersResponse = await fetch(`${prodUrl}/api/auth/providers`);
    console.log('Providers Status:', providersResponse.status);
    
    if (providersResponse.status === 200) {
      const providers = await providersResponse.json();
      console.log('Available providers:', Object.keys(providers));
    }
    
    // Test the CSRF token endpoint
    console.log('\n📊 Checking CSRF token...');
    const csrfResponse = await fetch(`${prodUrl}/api/auth/csrf`);
    console.log('CSRF Status:', csrfResponse.status);
    
    if (csrfResponse.status === 200) {
      const csrf = await csrfResponse.json();
      console.log('CSRF token available:', !!csrf.csrfToken);
    }
    
    // Test session endpoint
    console.log('\n📊 Checking session...');
    const sessionResponse = await fetch(`${prodUrl}/api/auth/session`);
    console.log('Session Status:', sessionResponse.status);
    
    // Test the credentials endpoint with detailed error
    console.log('\n📊 Testing credentials endpoint...');
    const authResponse = await fetch(`${prodUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@digiwize.com',
        password: 'admin123',
        redirect: 'false',
        json: 'true'
      })
    });
    
    console.log('Auth Status:', authResponse.status);
    console.log('Auth Headers:', Object.fromEntries(authResponse.headers.entries()));
    
    const authText = await authResponse.text();
    console.log('Auth Response:', authText.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugProductionAuth();
