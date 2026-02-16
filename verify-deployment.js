// This script helps verify what Render is trying to deploy
console.log('=== Deployment Verification ===');
console.log('Current working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');

// Check if we're in backend directory
import { existsSync } from 'fs';
if (existsSync('./dist')) {
  console.log('Found dist directory');
} else {
  console.log('No dist directory found');
}

if (existsSync('./server')) {
  console.log('Found server directory');
} else {
  console.log('No server directory found');
}

console.log('==============================');