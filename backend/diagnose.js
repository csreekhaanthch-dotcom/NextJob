const fs = require('fs');
const path = require('path');

console.log('=== NextJob Backend Diagnosis Tool ===\n');

// Check current directory
console.log('1. Current working directory:', process.cwd());

// Check if we're in the right directory
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✓ Found package.json');
  const pkg = require(packagePath);
  console.log('✓ Package name:', pkg.name);
} else {
  console.log('✗ Could not find package.json');
  console.log('  Please run this script from the backend directory');
  process.exit(1);
}

// Check node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✓ Found node_modules directory');
} else {
  console.log('⚠ node_modules not found');
  console.log('  Run "npm install" to install dependencies');
}

// Check src directory and index.ts
const srcPath = path.join(process.cwd(), 'src');
const indexPath = path.join(srcPath, 'index.ts');

if (fs.existsSync(srcPath)) {
  console.log('✓ Found src directory');
  if (fs.existsSync(indexPath)) {
    console.log('✓ Found src/index.ts');
  } else {
    console.log('✗ Could not find src/index.ts');
  }
} else {
  console.log('✗ Could not find src directory');
}

// Check required dependencies
try {
  const requiredDeps = ['express', 'cors', 'dotenv'];
  const pkg = require('./package.json');
  
  console.log('\n2. Dependency Check:');
  for (const dep of requiredDeps) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`✓ ${dep}: ${pkg.dependencies[dep]}`);
    } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
      console.log(`✓ ${dep}: ${pkg.devDependencies[dep]} (dev)`);
    } else {
      console.log(`✗ Missing dependency: ${dep}`);
    }
  }
} catch (err) {
  console.log('✗ Could not check dependencies:', err.message);
}

// Check environment variables
console.log('\n3. Environment Variables Check:');
const envVars = ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'];
let envFileFound = false;

// Check for .env file
const envFilePath = path.join(process.cwd(), '.env');
if (fs.existsSync(envFilePath)) {
  console.log('✓ Found .env file');
  envFileFound = true;
  
  // Read .env file to check for required variables
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  for (const varName of envVars) {
    if (envContent.includes(varName)) {
      console.log(`✓ ${varName} found in .env`);
    } else {
      console.log(`⚠ ${varName} not found in .env`);
    }
  }
} else {
  console.log('⚠ .env file not found (create one from .env.example)');
}

// Check TypeScript installation
console.log('\n4. TypeScript Check:');
try {
  require.resolve('typescript');
  console.log('✓ TypeScript is available');
} catch (err) {
  console.log('✗ TypeScript is not available');
}

// Check environment
console.log('\n5. Environment Check:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  PORT:', process.env.PORT || 'not set (will default to 3001)');

console.log('\n=== Diagnosis Complete ===');
console.log('\nTo start the backend server, run:');
console.log('  npm install    # if node_modules missing');
console.log('  npm run dev    # to build and start server');

console.log('\nIf you encounter issues:');
console.log('  1. Check that no other process is using port 3001');
console.log('  2. Check for TypeScript compilation errors');
console.log('  3. Verify all dependencies are installed');
console.log('  4. Ensure ADZUNA_APP_ID and ADZUNA_APP_KEY are set in .env');