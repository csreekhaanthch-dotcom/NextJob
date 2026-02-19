import React from 'react';
import { Heart, AlertTriangle } from 'lucide-react';

const BookmarksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-xl shadow-md p-8">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Not Available</h2>
        <p className="text-gray-600 mb-6">
          Bookmarking features are not included in the deployed version.
        </p>
        <div className="text-left bg-white p-4 rounded-lg mb-6">
          <p className="font-medium text-gray-900 mb-2">To enable bookmarks:</p>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li>Download the source code</li>
            <li>Set up MongoDB locally or use MongoDB Atlas</li>
            <li>Configure MONGODB_URI in your backend .env file</li>
            <li>Run the application locally</li>
          </ol>
        </div>
        <a 
          href="/jobs" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Jobs
        </a>
      </div>
    </div>
  );
};

export default BookmarksPage;