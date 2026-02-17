const fs = require('fs');
const path = require('path');

console.log('Checking backend setup...');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found. Please run "npm install" in the backend directory.');
  process.exit(1);
}

// Check if required dependencies are installed
const requiredDeps = ['express', 'cors', 'dotenv'];
const packageJson = require('./package.json');

for (const dep of requiredDeps) {
  if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
    console.log(`❌ Required dependency "${dep}" not found in package.json`);
    process.exit(1);
  }
}

// Check for environment variables
console.log('Checking for required environment variables...');
const envVars = ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'];
let envIssues = 0;

// Check for .env file
const envFilePath = path.join(__dirname, '.env');
if (!fs.existsSync(envFilePath)) {
  console.log('⚠ Warning: .env file not found. Copy .env.example to .env and add your credentials.');
  envIssues++;
} else {
  // Read .env file to check for required variables
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  for (const varName of envVars) {
    if (!envContent.includes(varName + '=')) {
      console.log(`⚠ Warning: ${varName} not found in .env file`);
      envIssues++;
    }
  }
}

if (envIssues > 0) {
  console.log('Please configure your environment variables before starting the server.');
}

console.log('✅ Backend setup check passed');
console.log('Run "npm run dev" to start the backend server');