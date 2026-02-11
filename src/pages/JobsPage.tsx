import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Building, Calendar, Filter } from 'lucide-react';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';

// Mock data for demonstration
const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120k - $150k",
    type: "Full-time",
    posted: "2 days ago",
    description: "We're looking for an experienced frontend developer to join our team...",
    tags: ["React", "TypeScript", "Tailwind"],
    logo: "https://placehold.co/60x60"
  },
  {
    id: 2,
    title: "Product Manager",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$130k - $160k",
    type: "Full-time",
    posted: "1 week ago",
    description: "Join our product team to drive innovation and growth...",
    tags: ["Product Strategy", "Analytics", "Agile"],
    logo: "https://placehold.co/60x60"
  },
  {
    id: 3,
    title: "UX Designer",
    company: "DesignStudio",
    location: "New York, NY",
    salary: "$90k - $120k",
    type: "Full-time",
    posted: "3 days ago",
    description: "Create beautiful and intuitive user experiences for our products...",
    tags: ["Figma", "Prototyping", "Research"],
    logo: "https://placehold.co/60x60"
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "DataSystems",
    location: "Austin, TX",
    salary: "$110k - $140k",
    type: "Full-time",
    posted: "5 days ago",
    description: "Build scalable backend systems for our data platform...",
    tags: ["Node.js", "Python", "AWS"],
    logo: "https://placehold.co/60x60"
  },
  {
    id: 5,
    title: "DevOps Specialist",
    company: "CloudTech",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Contract",
    posted: "1 day ago",
    description: "Implement and maintain our cloud infrastructure...",
    tags: ["Kubernetes", "Docker", "CI/CD"],
    logo: "https://placehold.co/60x60"
  },
  {
    id: 6,
    title: "Marketing Intern",
    company: "GrowthCo",
    location: "Los Angeles, CA",
    salary: "$20/hr",
    type: "Internship",
    posted: "4 days ago",
    description: "Support our marketing team with campaigns and analytics...",
    tags: ["Social Media", "Content", "Analytics"],
    logo: "https://placehold.co/60x60"
  }
];

const JobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    let results = mockJobs;
    
    if (debouncedSearchTerm) {
      results = results.filter(job => 
        job.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }
    
    if (locationFilter) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    if (jobTypeFilter) {
      results = results.filter(job => 
        job.type.toLowerCase().includes(jobTypeFilter.toLowerCase())
      );
    }
    
    setFilteredJobs(results);
  }, [debouncedSearchTerm, locationFilter, jobTypeFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
        <p className="text-gray-600">Browse through our collection of opportunities</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Location"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full appearance-none bg-white"
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Remote
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Entry Level
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            $100k+
          </button>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
        </p>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Most Recent</option>
          <option>Most Relevant</option>
          <option>Salary: High to Low</option>
        </select>
      </div>
      
      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      
      {/* Load More */}
      {filteredJobs.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Load More Jobs
          </button>
        </div>
      )}
      
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-8 rounded-xl max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more opportunities
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;