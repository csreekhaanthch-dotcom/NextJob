import React from 'react';
import { X } from 'lucide-react';

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button className="text-sm text-blue-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          Clear all
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Any Experience</option>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Any Salary</option>
            <option>$50k - $80k</option>
            <option>$80k - $120k</option>
            <option>$120k - $150k</option>
            <option>$150k+</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remote</label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Options</option>
            <option>Remote Only</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;