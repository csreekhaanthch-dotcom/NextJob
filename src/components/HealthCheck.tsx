import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      const newDetails: string[] = [];
      newDetails.push(`Checking at: ${new Date().toLocaleTimeString()}`);
      
      try {
        // Test basic connectivity first
        newDetails.push('Testing connectivity to backend...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('http://localhost:3001/health', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        newDetails.push(`Received response: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const health = await response.json();
        newDetails.push(`Backend status: ${health.status}`);
        
        if (isMounted) {
          if (health.status === 'ok') {
            setStatus('healthy');
            setMessage('Backend is running and healthy');
          } else {
            setStatus('error');
            setMessage('Backend is running but unhealthy');
          }
          setDetails(newDetails);
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setDetails([...details, ...newDetails]);
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              setMessage('Backend connection timed out (took longer than 5 seconds)');
              setDetails(prev => [...prev, 'Request timed out - backend may be slow to start']);
            } else {
              setMessage(`Backend connectivity issue: ${error.message}`);
              setDetails(prev => [...prev, `Error details: ${error.message}`]);
            }
          } else {
            setMessage('Backend is not reachable. Please ensure the backend server is running.');
            setDetails(prev => [...prev, 'Unknown error occurred']);
          }
        }
      }
    };

    // Only show health check in development
    if (import.meta.env.DEV) {
      checkHealth();
    } else {
      // In production, assume backend is handled by Render
      if (isMounted) {
        setStatus('healthy');
        setMessage('Application is running in production mode');
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Don't show health check in production
  if (!import.meta.env.DEV) {
    return null;
  }

  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Checking backend connectivity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'healthy') {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {message}
          </p>
          <p className="text-sm text-red-700 mt-1">
            Please make sure the backend server is running at http://localhost:3001
          </p>
          <p className="text-sm text-red-700 mt-1">
            Try running: <code className="bg-gray-100 px-1 rounded">cd backend && npm install && npm run dev</code>
          </p>
          
          {details.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm text-red-700 cursor-pointer">Diagnostic details</summary>
              <ul className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded">
                {details.map((detail, index) => (
                  <li key={index} className="mb-1 last:mb-0">• {detail}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;