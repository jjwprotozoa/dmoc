// scripts/compare-schemas.js
// Compare schema-dev.prisma and schema-prod.prisma to ensure they're in sync

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function normalizeModelContent(content) {
  // Remove comments
  let normalized = content
    .split('\n')
    .map(line => {
      const commentIndex = line.indexOf('//');
      return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
    })
    .join('\n');
  
  // Normalize whitespace - preserve structure but normalize spacing
  normalized = normalized
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/\s*\{\s*/g, '{')  // Normalize braces
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*\[\s*/g, '[')
    .replace(/\s*\]\s*/g, ']')
    .replace(/\s*@\s*/g, '@')  // Normalize decorators
    .replace(/\s*,\s*/g, ',')  // Normalize commas
    .trim();
  
  return normalized;
}

function extractModels(content) {
  const models = [];
  // Match model declarations, handling nested braces properly
  const modelRegex = /model\s+(\w+)\s*\{/g;
  let match;
  
  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const startPos = match.index + match[0].length;
    
    // Find matching closing brace, handling nested braces
    let braceCount = 1;
    let pos = startPos;
    let endPos = -1;
    
    while (pos < content.length && braceCount > 0) {
      if (content[pos] === '{') braceCount++;
      if (content[pos] === '}') braceCount--;
      if (braceCount === 0) {
        endPos = pos;
        break;
      }
      pos++;
    }
    
    if (endPos !== -1) {
      const modelContent = content.substring(startPos, endPos);
      models.push({
        name: modelName,
        content: modelContent.trim(),
      });
    }
  }
  
  return models;
}

function main() {
  const devSchemaPath = path.join(process.cwd(), 'prisma', 'schema-dev.prisma');
  const prodSchemaPath = path.join(process.cwd(), 'prisma', 'schema-prod.prisma');
  
  if (!fs.existsSync(devSchemaPath)) {
    log('❌ schema-dev.prisma not found!', 'red');
    process.exit(1);
  }
  
  if (!fs.existsSync(prodSchemaPath)) {
    log('❌ schema-prod.prisma not found!', 'red');
    process.exit(1);
  }
  
  log('\n📋 Comparing Prisma Schemas', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const devContent = fs.readFileSync(devSchemaPath, 'utf8');
  const prodContent = fs.readFileSync(prodSchemaPath, 'utf8');
  
  // Check datasource providers (look in datasource block specifically)
  const devDatasourceMatch = devContent.match(/datasource\s+db\s*\{[^}]*provider\s*=\s*"([^"]+)"/s);
  const prodDatasourceMatch = prodContent.match(/datasource\s+db\s*\{[^}]*provider\s*=\s*"([^"]+)"/s);
  const devProvider = devDatasourceMatch?.[1] || 'unknown';
  const prodProvider = prodDatasourceMatch?.[1] || 'unknown';
  
  log(`\n📊 Datasource Providers:`, 'cyan');
  log(`   Dev:  ${devProvider}`, devProvider === 'sqlite' ? 'green' : 'yellow');
  log(`   Prod: ${prodProvider}`, prodProvider === 'postgresql' ? 'green' : 'yellow');
  
  if (devProvider !== 'sqlite' || prodProvider !== 'postgresql') {
    log('⚠️  Warning: Expected dev=sqlite, prod=postgresql', 'yellow');
  }
  
  // Extract models
  const devModels = extractModels(devContent);
  const prodModels = extractModels(prodContent);
  
  log(`\n📦 Models:`, 'cyan');
  log(`   Dev:  ${devModels.length} models`, 'blue');
  log(`   Prod: ${prodModels.length} models`, 'blue');
  
  if (devModels.length !== prodModels.length) {
    log('❌ Model count mismatch!', 'red');
    
    const devModelNames = new Set(devModels.map(m => m.name));
    const prodModelNames = new Set(prodModels.map(m => m.name));
    
    const onlyInDev = [...devModelNames].filter(name => !prodModelNames.has(name));
    const onlyInProd = [...prodModelNames].filter(name => !devModelNames.has(name));
    
    if (onlyInDev.length > 0) {
      log(`   Models only in dev: ${onlyInDev.join(', ')}`, 'yellow');
    }
    if (onlyInProd.length > 0) {
      log(`   Models only in prod: ${onlyInProd.join(', ')}`, 'yellow');
    }
  }
  
  // Compare each model individually
  log(`\n🔍 Schema Comparison:`, 'cyan');
  
  const devModelMap = new Map(devModels.map(m => [m.name, m]));
  const prodModelMap = new Map(prodModels.map(m => [m.name, m]));
  const allModelNames = new Set([...devModelMap.keys(), ...prodModelMap.keys()]);
  
  const missingModels = [];
  const differingModels = [];
  
  for (const modelName of allModelNames) {
    const devModel = devModelMap.get(modelName);
    const prodModel = prodModelMap.get(modelName);
    
    if (!devModel) {
      missingModels.push({ name: modelName, location: 'dev' });
    } else if (!prodModel) {
      missingModels.push({ name: modelName, location: 'prod' });
    } else {
      const devModelNorm = normalizeModelContent(devModel.content);
      const prodModelNorm = normalizeModelContent(prodModel.content);
      
      if (devModelNorm !== prodModelNorm) {
        differingModels.push(modelName);
      }
    }
  }
  
  if (missingModels.length === 0 && differingModels.length === 0) {
    log('✅ Schemas are synchronized!', 'green');
    log('   All models and fields match (excluding datasource provider)', 'green');
  } else {
    if (missingModels.length > 0) {
      log('❌ Missing models detected!', 'red');
      for (const { name, location } of missingModels) {
        log(`   ⚠️  Model "${name}" exists in ${location === 'dev' ? 'dev' : 'prod'} but not in ${location === 'dev' ? 'prod' : 'dev'}`, 'yellow');
      }
    }
    
    if (differingModels.length > 0) {
      log('❌ Model differences detected!', 'red');
      log(`   ${differingModels.length} model(s) have structural differences:`, 'yellow');
      differingModels.forEach(name => {
        log(`   ⚠️  Model "${name}" differs between dev and prod`, 'yellow');
      });
    }
    
    log('\n💡 To sync schemas:', 'cyan');
    log('   node scripts/copy-schema.js prisma/schema-dev.prisma prisma/schema-prod.prisma', 'blue');
    log('   Then manually update datasource provider in schema-prod.prisma', 'blue');
  }
  
  log('\n' + '='.repeat(50) + '\n', 'cyan');
}

main();

