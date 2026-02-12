import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Building, Calendar, Filter } from 'lucide-react';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const JobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('keyword', debouncedSearchTerm);
        if (locationFilter) params.append('location', locationFilter);
        if (jobTypeFilter === 'remote') params.append('remote', 'true');

        const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match our component expectations
        const transformedJobs = data.jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || (job.remote ? 'Remote' : 'Unknown'),
          salary: job.salary || 'Not specified',
          type: job.remote ? 'Full-time' : 'Full-time', // Default to full-time
          posted: job.posted_date ? `${Math.floor((Date.now() - new Date(job.posted_date)) / (1000 * 60 * 60 * 24))} days ago` : 'Recently',
          description: job.description || 'No description available',
          tags: job.tags ? JSON.parse(job.tags) : [],
          logo: 'https://placehold.co/60x60'
        }));

        setJobs(transformedJobs);
        setFilteredJobs(transformedJobs);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError(err.message);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedSearchTerm, locationFilter, jobTypeFilter]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

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
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-8 rounded-xl max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading jobs...</h3>
            <p className="text-gray-600">
              Fetching the latest job opportunities for you
            </p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 p-8 rounded-xl max-w-md mx-auto">
            <div className="bg-red-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 font-bold text-xl">!</span>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error loading jobs</h3>
            <p className="text-red-600">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Job Listings */}
      {!loading && !error && (
        <>
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
        </>
      )}
    </div>
  );
};

export default JobsPage;