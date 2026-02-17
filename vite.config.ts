import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('Proxying API request:', path);
          return path.replace(/^\/api/, '/api');
        },
      },
      '/health': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('Proxying health request:', path);
          return path;
        },
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Add this for proper asset handling
  base: './'
});