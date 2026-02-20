import React from 'react';
import { AlertTriangle } from 'lucide-react';

const BookmarksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-md p-8">
        <AlertTriangle className="h-16 w-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Feature Not Available</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Bookmarking features are not included in the deployed version.</p>
        <a href="/jobs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Browse Jobs</a>
      </div>
    </div>
  );
};

export default BookmarksPage;