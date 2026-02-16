import React from 'react';
import { MapPin, Building, Calendar, DollarSign } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description: string;
  tags: string[];
  logo: string;
}

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden job-card transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <img 
              src={job.logo} 
              alt={`${job.company} logo`} 
              className="w-12 h-12 rounded-lg object-contain mr-4 border border-gray-200"
              onError={(e) => {
                // Set a fallback image if the logo fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/60x60/cccccc/ffffff?text=Logo';
              }}
            />
            <div>
              <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
              <p className="text-gray-600 flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {job.company}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
            {job.type}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {job.posted}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            {job.salary}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Apply Now
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Save Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;