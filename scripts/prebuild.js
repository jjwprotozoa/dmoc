// scripts/prebuild.js
// Set up environment variables for Vercel builds before running Prisma

const fs = require('fs');

// Handle Vercel PostgreSQL environment variable naming
// Vercel automatically prefixes database variables with the project name
const possibleNames = [
  'dmoc_DATABASE_URL',
  'dmoc_POSTGRES_URL', 
  'POSTGRES_URL',
  'DATABASE_URL'
];

// Find and set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  for (const name of possibleNames) {
    if (process.env[name]) {
      process.env.DATABASE_URL = process.env[name];
      console.log(`✅ [Prebuild] Using ${name} as DATABASE_URL`);
      
      // Log masked URL for debugging
      const dbUrl = process.env.DATABASE_URL;
      const maskedUrl = dbUrl.includes('@') 
        ? dbUrl.replace(/:\/\/.*@/, '://***@')
        : 'file:./dev.db';
      console.log(`🗄️ [Prebuild] Database URL: ${maskedUrl}`);
      break;
    }
  }
}

// If still no DATABASE_URL, use development database
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [Prebuild] No DATABASE_URL found, using development database');
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

console.log('✅ [Prebuild] Environment variables configured');

