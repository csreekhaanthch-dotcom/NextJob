const { spawn } = require('child_process');
const fs = require('fs');

console.log('Building NextJob application...');

// Function to run command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', ...options });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

// Main build process
async function build() {
  try {
    // Clean installation
    console.log('Cleaning previous installations...');
    
    // Install frontend dependencies
    console.log('Installing frontend dependencies...');
    await runCommand('npm', ['install']);
    
    // Install backend dependencies
    console.log('Installing backend dependencies...');
    await runCommand('npm', ['install'], { cwd: 'backend' });
    
    // Build frontend
    console.log('Building frontend...');
    await runCommand('npm', ['run', 'build']);
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();