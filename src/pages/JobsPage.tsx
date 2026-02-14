import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { api, Job } from '@/services/api';

interface SearchState {
  query: string;
  location: string;
  page: number;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>({
    query: 'software engineer',
    location: '',
    page: 1,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Local state for search inputs
  const [searchTerm, setSearchTerm] = useState('software engineer');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.searchJobs({
        query: searchState.query,
        location: searchState.location,
        page: searchState.page,
      });
      setJobs(response.jobs);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchState]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => {
    setSearchState({
      query: searchTerm || 'software engineer',
      location: locationFilter,
      page: 1,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchState(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleRemoteToggle = () => {
    setRemoteFilter(!remoteFilter);
    // Note: Remote filtering is done client-side since JSearch API
    // handles location-based remote search through the location parameter
  };

  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Apply job type filter client-side
    if (jobTypeFilter) {
      const normalizedFilter = jobTypeFilter.toLowerCase();
      result = result.filter(job => {
        const haystack = [job.title, job.description, ...(job.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (normalizedFilter === 'internship') {
          return haystack.includes('intern');
        }

        if (normalizedFilter === 'contract') {
          return haystack.includes('contract') || haystack.includes('freelance');
        }

        if (normalizedFilter === 'part-time') {
          return haystack.includes('part-time') || haystack.includes('part time');
        }

        if (normalizedFilter === 'full-time') {
          return haystack.includes('full-time') || haystack.includes('full time');
        }

        return true;
      });
    }

    // Apply remote filter client-side
    if (remoteFilter) {
      result = result.filter(job => job.remote);
    }

    return result;
  }, [jobs, jobTypeFilter, remoteFilter]);

  if (loading && jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Browse through our collection of opportunities</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              remoteFilter 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            onClick={handleRemoteToggle}
          >
            Remote Only
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
            Entry Level
          </button>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
            $100k+
          </button>
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error loading jobs</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredJobs.length}</span> of{' '}
          <span className="font-semibold">{total}</span> jobs
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
      
      {/* Loading More */}
      {loading && jobs.length > 0 && (
        <div className="text-center mt-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* No Results */}
      {filteredJobs.length === 0 && !loading && (
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(searchState.page - 1)}
            disabled={searchState.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (searchState.page <= 3) {
                pageNum = i + 1;
              } else if (searchState.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = searchState.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchState.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => handlePageChange(searchState.page + 1)}
            disabled={searchState.page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
