// Simple test script to verify your deployment
console.log('Testing deployment configuration...\n');

// Your deployment URLs
const frontendUrl = 'https://nextjob-frontend.onrender.com';
const backendUrl = 'https://nextjob-cnah.onrender.com';

console.log('Frontend URL:', frontendUrl);
console.log('Backend URL:', backendUrl);
console.log('\nExpected behavior:');
console.log('- Frontend should load at the frontend URL');
console.log('- Frontend should make API calls to the backend URL');
console.log('- Backend should connect to JSearch API with your RAPIDAPI_KEY');
console.log('\nMake sure to:');
console.log('1. Add your RAPIDAPI_KEY to your Render backend environment variables');
console.log('2. Check that both services are deployed successfully');
console.log('3. Visit your frontend URL to test the application');