// check-prod-env.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkProductionEnvironment() {
  console.log('🔍 Checking production environment configuration...');
  
  const prodUrl = 'https://dmoc.vercel.app';
  
  try {
    // Check if we can access the environment info endpoint
    console.log('\n📊 Checking environment info...');
    
    // Test the health endpoint
    const healthResponse = await fetch(`${prodUrl}/api/health`);
    console.log('Health endpoint:', healthResponse.status);
    
    // Test the auth session endpoint
    const sessionResponse = await fetch(`${prodUrl}/api/auth/session`);
    console.log('Session endpoint:', sessionResponse.status);
    
    if (sessionResponse.status === 200) {
      const session = await sessionResponse.json();
      console.log('Session data:', session);
    }
    
    // Test a simple API endpoint to see if the app is working
    console.log('\n📊 Testing API endpoints...');
    
    // Check if there are any API routes that might give us info
    const apiResponse = await fetch(`${prodUrl}/api/trpc/manifest.getAll`);
    console.log('TRPC endpoint:', apiResponse.status);
    
    // Test the sign-in page directly
    const signInResponse = await fetch(`${prodUrl}/sign-in`);
    console.log('Sign-in page:', signInResponse.status);
    
    if (signInResponse.status === 200) {
      const html = await signInResponse.text();
      console.log('Sign-in page accessible:', html.includes('Sign in to LogisticsController'));
    }
    
  } catch (error) {
    console.error('❌ Environment check failed:', error.message);
  }
}

checkProductionEnvironment();
