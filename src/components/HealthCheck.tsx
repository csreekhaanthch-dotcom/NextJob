import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      try {
        // Only show health check in development
        if (!import.meta.env.DEV) {
          if (isMounted) {
            setStatus('healthy');
            setMessage('Application is running');
          }
          return;
        }
        
        const response = await api.checkHealth();
        if (isMounted) {
          setStatus('healthy');
          setMessage('Backend is running and healthy');
        }
      } catch (error) {
        console.error('Health check error:', error);
        if (isMounted) {
          setStatus('error');
          if (error instanceof Error) {
            setMessage(`Backend connectivity issue: ${error.message}`);
          } else {
            setMessage('Backend is not reachable. Please ensure the backend server is running.');
          }
        }
      }
    };

    checkHealth();
    
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
        <div className="flex">
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
        <div className="flex">
          <div className="flex-shrink-0">
            ✓
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
      <div className="flex">
        <div className="flex-shrink-0">
          ✗
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {message}
          </p>
          <p className="text-sm text-red-700 mt-1">
            Please make sure the backend server is running at the correct URL
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;