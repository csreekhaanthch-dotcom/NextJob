import React from 'react';
import { MapPin, Building, Calendar, Globe, DollarSign } from 'lucide-react';
import { Job } from '../services/api';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // Convert timestamp to readable date
  const formatPostedDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Generate a placeholder logo URL
  const logoUrl = `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`;

  const handleApply = () => {
    window.open(job.url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden job-card transition-all duration-200 hover:shadow-md hover:border-blue-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
          <div className="flex items-start">
            <img 
              src={logoUrl}
              alt={`${job.company} logo`} 
              className="w-12 h-12 rounded-lg object-contain mr-4 border border-gray-200 flex-shrink-0"
              onError={(e) => {
                // Set a fallback image if the logo fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/60x60/cccccc/ffffff?text=Logo';
              }}
            />
            <div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{job.title}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <Building className="h-4 w-4 mr-1 flex-shrink-0" />
                {job.company}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            {formatPostedDate(job.posted_date)}
          </div>
          {job.salary && (
            <div className="flex items-center text-gray-500 text-sm">
              <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
              {job.salary}
            </div>
          )}
        </div>
        
        {job.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
          </p>
        )}
        
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 5).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{job.tags.length - 5} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <button 
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;