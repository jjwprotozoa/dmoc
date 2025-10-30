// scripts/load-env.js
// Load environment variables from .env files for Prisma CLI
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Try to load .env.local first, then .env.production, then .env
const envFiles = ['.env.local', '.env.production', '.env'];

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Set environment variable if not already set
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
    console.log(`✅ Loaded environment variables from ${envFile}`);
    break;
  }
}

// Handle Vercel PostgreSQL environment variable naming
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
      console.log(`✅ Using ${name} as DATABASE_URL`);
      break;
    }
  }
}

// Verify DATABASE_URL is set
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.includes('@') 
    ? dbUrl.replace(/:\/\/.*@/, '://***@')
    : 'file:./dev.db';
  console.log(`🗄️ Database URL: ${maskedUrl}`);
} else {
  console.error('❌ DATABASE_URL not found. Please set it in .env.local or .env.production');
  process.exit(1);
}

// If command line arguments are provided, spawn the command with the environment variables
const args = process.argv.slice(2);
if (args.length > 0) {
  const isWindows = process.platform === 'win32';
  const [command, ...commandArgs] = args;
  
  // Use npx for prisma commands, otherwise use the command directly
  const cmd = command === 'prisma' ? 'npx' : command;
  const spawnArgs = command === 'prisma' ? ['prisma', ...commandArgs] : commandArgs;
  
  const child = spawn(cmd, spawnArgs, {
    env: process.env,
    stdio: 'inherit',
    shell: isWindows
  });
  
  child.on('error', (error) => {
    console.error(`❌ Failed to start command: ${error.message}`);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

