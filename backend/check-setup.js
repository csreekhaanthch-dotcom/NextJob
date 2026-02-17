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

console.log('✅ Backend setup check passed');
console.log('Run "npm run dev" to start the backend server');