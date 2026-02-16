import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.checkHealth();
        if (health.status === 'healthy') {
          setStatus('healthy');
          setMessage('Backend is running and healthy');
        } else {
          setStatus('error');
          setMessage('Backend is running but unhealthy');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Backend is not reachable');
      }
    };

    checkHealth();
  }, []);

  if (status === 'checking') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Checking backend connectivity...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'healthy') {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
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
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
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
            Please make sure the backend server is running at {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;