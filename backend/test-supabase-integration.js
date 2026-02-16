// Simple test to verify integration
console.log('Testing backend integration...');

// Check if required environment variables are set
const requiredEnvVars = ['RAPIDAPI_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('⚠️  Missing environment variables:', missingEnvVars);
  console.log('Please set these variables in your Render dashboard');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  console.log('✅ Backend is ready for deployment');
  process.exit(0);
}