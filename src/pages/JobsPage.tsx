import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, AlertCircle, RefreshCw, SlidersHorizontal } from 'lucide-react';
import JobCard from '../components/JobCard';
import { api, Job } from '../services/api';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.searchJobs({
        keyword: searchTerm,
        location: locationFilter,
        remote: remoteFilter,
        page: page,
        limit: 12
      });
      
      setJobs(response.jobs);
      setTotalPages(response.totalPages);
      setInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, locationFilter, remoteFilter, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  const handleRetry = () => {
    fetchJobs();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setJobTypeFilter('');
    setRemoteFilter(false);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initialLoad && loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
          <p className="text-gray-600">Browse through our collection of opportunities</p>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="City, state, or remote"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="md:col-span-3 flex gap-2">
            <button
              className={`flex-1 px-4 py-3 border rounded-lg flex items-center justify-center gap-2 ${
                isFiltersOpen 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            
            <button
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {isFiltersOpen && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Any Experience</option>
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Any Salary</option>
                  <option>$50k - $80k</option>
                  <option>$80k - $120k</option>
                  <option>$120k - $150k</option>
                  <option>$150k+</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    remoteFilter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setRemoteFilter(!remoteFilter)}
                >
                  {remoteFilter ? 'Remote Only' : 'Remote Available'}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {(searchTerm || locationFilter || jobTypeFilter || remoteFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Keyword: {searchTerm}
                <button 
                  className="ml-2 hover:bg-blue-200 rounded-full p-1"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              </span>
            )}
            
            {locationFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Location: {locationFilter}
                <button 
                  className="ml-2 hover:bg-green-200 rounded-full p-1"
                  onClick={() => setLocationFilter('')}
                >
                  ×
                </button>
              </span>
            )}
            
            {jobTypeFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Type: {jobTypeFilter}
                <button 
                  className="ml-2 hover:bg-purple-200 rounded-full p-1"
                  onClick={() => setJobTypeFilter('')}
                >
                  ×
                </button>
              </span>
            )}
            
            {remoteFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                Remote Only
                <button 
                  className="ml-2 hover:bg-indigo-200 rounded-full p-1"
                  onClick={() => setRemoteFilter(false)}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error loading jobs</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{jobs.length}</span> jobs
            {totalPages > 1 && (
              <span> • Page <span className="font-semibold">{page}</span> of{' '}
              <span className="font-semibold">{totalPages}</span></span>
            )}
          </p>
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Most Recent</option>
              <option>Most Relevant</option>
              <option>Salary: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job as any} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <div className="text-gray-600 text-sm">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`w-8 h-8 rounded-full mx-1 ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className={`px-3 py-1 rounded ${
                    page === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : !loading && !error && (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-8 rounded-xl max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more opportunities
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {loading && !initialLoad && (
        <div className="text-center mt-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;