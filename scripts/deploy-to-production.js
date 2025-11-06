// scripts/deploy-to-production.js
// Comprehensive production deployment script that ensures schemas, migrations, and seeds are synced

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    const output = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkSchemaSync() {
  log('\n📋 Step 1: Checking schema synchronization...', 'cyan');
  
  const devSchema = path.join(process.cwd(), 'prisma', 'schema-dev.prisma');
  const prodSchema = path.join(process.cwd(), 'prisma', 'schema-prod.prisma');
  
  if (!fs.existsSync(devSchema)) {
    log('❌ schema-dev.prisma not found!', 'red');
    return false;
  }
  
  if (!fs.existsSync(prodSchema)) {
    log('❌ schema-prod.prisma not found!', 'red');
    return false;
  }
  
  // Read both schemas and compare (excluding datasource provider)
  const devContent = fs.readFileSync(devSchema, 'utf8');
  const prodContent = fs.readFileSync(prodSchema, 'utf8');
  
  // Normalize by removing datasource differences and whitespace
  const normalizeSchema = (content) => {
    return content
      .replace(/datasource db \{[\s\S]*?provider = "[^"]+"[\s\S]*?url[^}]*?\}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const devNormalized = normalizeSchema(devContent);
  const prodNormalized = normalizeSchema(prodContent);
  
  if (devNormalized === prodNormalized) {
    log('✅ Schemas are synchronized', 'green');
    return true;
  } else {
    log('⚠️  Schemas differ! Review differences:', 'yellow');
    log('   Run: git diff prisma/schema-dev.prisma prisma/schema-prod.prisma', 'yellow');
    log('   Or sync with: node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma', 'yellow');
    return false;
  }
}

function checkEnvironment() {
  log('\n🔐 Step 2: Checking environment setup...', 'cyan');
  
  const envFiles = ['.env.production', '.env.local', '.env'];
  let foundEnv = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      log(`✅ Found ${envFile}`, 'green');
      foundEnv = true;
      
      // Check for DATABASE_URL
      const content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('DATABASE_URL')) {
        log('✅ DATABASE_URL found in environment file', 'green');
      } else {
        log('⚠️  DATABASE_URL not found in environment file', 'yellow');
        log('   Make sure to set DATABASE_URL for production database', 'yellow');
      }
      break;
    }
  }
  
  if (!foundEnv) {
    log('⚠️  No environment file found (.env.production, .env.local, or .env)', 'yellow');
    log('   Run: vercel env pull .env.production', 'yellow');
  }
  
  return foundEnv;
}

function syncSchemas() {
  log('\n🔄 Step 3: Syncing schemas...', 'cyan');
  
  const result = exec('node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma');
  
  if (result.success) {
    log('✅ Schema copied successfully', 'green');
    
    // Update the datasource provider in schema-prod.prisma
    const prodSchemaPath = path.join(process.cwd(), 'prisma', 'schema-prod.prisma');
    let prodContent = fs.readFileSync(prodSchemaPath, 'utf8');
    
    // Replace SQLite with PostgreSQL
    prodContent = prodContent.replace(
      /provider = "sqlite"/,
      'provider = "postgresql"'
    );
    prodContent = prodContent.replace(
      /url\s*=\s*"file:\.\/dev\.db"/,
      'url      = env("DATABASE_URL")'
    );
    
    fs.writeFileSync(prodSchemaPath, prodContent);
    log('✅ Updated datasource to PostgreSQL', 'green');
    return true;
  } else {
    log('❌ Failed to sync schemas', 'red');
    return false;
  }
}

function pushSchema() {
  log('\n🗄️  Step 4: Pushing schema to production database...', 'cyan');
  
  log('   Switching to production schema...', 'blue');
  const switchResult = exec('npm run db:prod');
  
  if (!switchResult.success) {
    log('❌ Failed to switch to production schema', 'red');
    return false;
  }
  
  log('   Pushing schema changes...', 'blue');
  const pushResult = exec('npm run db:push');
  
  if (pushResult.success) {
    log('✅ Schema pushed successfully', 'green');
    return true;
  } else {
    log('❌ Failed to push schema', 'red');
    return false;
  }
}

function seedDatabase() {
  log('\n🌱 Step 5: Seeding production database...', 'cyan');
  
  const seedResult = exec('npm run db:seed:prod');
  
  if (seedResult.success) {
    log('✅ Database seeded successfully', 'green');
    return true;
  } else {
    log('❌ Failed to seed database', 'red');
    return false;
  }
}

function switchBackToDev() {
  log('\n🔄 Step 6: Switching back to development schema...', 'cyan');
  
  const result = exec('npm run db:dev');
  
  if (result.success) {
    log('✅ Switched back to development schema', 'green');
    return true;
  } else {
    log('⚠️  Failed to switch back to dev (non-critical)', 'yellow');
    return false;
  }
}

async function main() {
  log('🚀 DMOC Production Deployment Script', 'bright');
  log('=====================================\n', 'bright');
  
  const args = process.argv.slice(2);
  const skipSchemaCheck = args.includes('--skip-schema-check');
  const skipSchemaSync = args.includes('--skip-schema-sync');
  const skipSeed = args.includes('--skip-seed');
  const autoSync = args.includes('--auto-sync');
  
  let allStepsPassed = true;
  
  // Step 1: Check schema sync
  if (!skipSchemaCheck) {
    const schemasInSync = checkSchemaSync();
    if (!schemasInSync && !autoSync) {
      log('\n⚠️  Schemas are not synchronized.', 'yellow');
      log('   Run with --auto-sync to automatically sync schemas', 'yellow');
      log('   Or manually sync and run again', 'yellow');
      process.exit(1);
    } else if (!schemasInSync && autoSync) {
      if (!syncSchemas()) {
        allStepsPassed = false;
      }
    }
  }
  
  // Step 2: Check environment
  checkEnvironment();
  
  // Step 3: Sync schemas if needed
  if (!skipSchemaSync && autoSync) {
    if (!syncSchemas()) {
      allStepsPassed = false;
    }
  }
  
  // Step 4: Push schema
  if (!pushSchema()) {
    allStepsPassed = false;
  }
  
  // Step 5: Seed database
  if (!skipSeed) {
    if (!seedDatabase()) {
      allStepsPassed = false;
    }
  }
  
  // Step 6: Switch back to dev
  switchBackToDev();
  
  // Summary
  log('\n' + '='.repeat(50), 'bright');
  if (allStepsPassed) {
    log('✅ Production deployment completed successfully!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('   1. Verify deployment on Vercel', 'blue');
    log('   2. Test the production app', 'blue');
    log('   3. Sign in with: admin@digiwize.com / admin123', 'blue');
  } else {
    log('⚠️  Deployment completed with warnings/errors', 'yellow');
    log('   Review the output above and fix any issues', 'yellow');
  }
  log('='.repeat(50) + '\n', 'bright');
  
  process.exit(allStepsPassed ? 0 : 1);
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

