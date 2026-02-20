import React from 'react';
const JobCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 mr-4"></div>
        <div><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="flex justify-end pt-2">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-28"></div>
      </div>
    </div>
  </div>
);
export default JobCardSkeleton;
