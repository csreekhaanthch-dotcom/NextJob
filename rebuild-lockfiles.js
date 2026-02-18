const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Recreating lock files...');

// Remove existing lock files
try {
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('Removed package-lock.json');
  }
  
  if (fs.existsSync('backend/package-lock.json')) {
    fs.unlinkSync('backend/package-lock.json');
    console.log('Removed backend/package-lock.json');
  }
  
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('Removed node_modules');
  }
  
  if (fs.existsSync('backend/node_modules')) {
    fs.rmSync('backend/node_modules', { recursive: true, force: true });
    console.log('Removed backend/node_modules');
  }
} catch (err) {
  console.log('Error removing files:', err.message);
}

console.log('Installing frontend dependencies...');
const frontendInstall = spawn('npm', ['install'], { stdio: 'inherit' });

frontendInstall.on('close', (code) => {
  if (code === 0) {
    console.log('Frontend dependencies installed successfully');
    
    console.log('Installing backend dependencies...');
    const backendInstall = spawn('npm', ['install'], {
      cwd: 'backend',
      stdio: 'inherit'
    });
    
    backendInstall.on('close', (code) => {
      if (code === 0) {
        console.log('Backend dependencies installed successfully');
        console.log('Lock files recreated successfully!');
      } else {
        console.error('Failed to install backend dependencies');
      }
    });
  } else {
    console.error('Failed to install frontend dependencies');
  }
});