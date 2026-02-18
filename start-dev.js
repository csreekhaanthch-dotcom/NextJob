const { spawn } = require('child_process');
const path = require('path');

console.log('Starting NextJob development environment...');

// Start backend server
const backend = spawn('node', ['backend/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' }
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data}`);
});

backend.on('close', (code) => {
  console.log(`[BACKEND] Process exited with code ${code}`);
});

// Start frontend development server
const frontend = spawn('npx', ['vite'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' }
});

frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[FRONTEND ERROR] ${data}`);
});

frontend.on('close', (code) => {
  console.log(`[FRONTEND] Process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});