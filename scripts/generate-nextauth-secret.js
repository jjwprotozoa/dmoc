// scripts/generate-nextauth-secret.js
// Generate a secure random string for NEXTAUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');
console.log('Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nCopy this to your Vercel environment variables as NEXTAUTH_SECRET');

