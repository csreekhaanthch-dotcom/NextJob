import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, AlertCircle, RefreshCw, SlidersHorizontal, X, Clock, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import { api, Job } from '../services/api';
import { useDebounce, useSearchHistory, useKeyboardShortcuts } from '../hooks/useSearch';

type SortOption = 'recent' | 'relevant' | 'salary_high' | 'salary_low';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'salary_high', label: 'Salary: High to Low' },
  { value: 'salary_low', label: 'Salary: Low to High' }
];

const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(() => searchParams.get('location') || '');
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  useKeyboardShortcuts([{ key: 'Escape', handler: () => setShowSearchHistory(false) }]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (debouncedLocation) params.set('location', debouncedLocation);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, debouncedLocation, page, setSearchParams]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.searchJobs({ search: debouncedSearchTerm, location: debouncedLocation, page, limit: 12 });
      if (debouncedSearchTerm && page === 1) addToHistory(debouncedSearchTerm);
      setJobs(response.jobs);
      setTotalPages(response.totalPages);
      setTotalJobs(response.total);
      setInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, debouncedLocation, page, addToHistory]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const sortedJobs = useMemo(() => {
    if (!jobs.length) return [];
    const sorted = [...jobs];
    switch (sortBy) {
      case 'recent': return sorted.sort((a, b) => b.posted_date - a.posted_date);
      case 'salary_high': return sorted.sort((a, b) => {
        const salA = a.salary ? parseFloat(a.salary.replace(/[^0-9.-]/g, '').split('-')[1] || '0') : 0;
        const salB = b.salary ? parseFloat(b.salary.replace(/[^0-9.-]/g, '').split('-')[1] || '0') : 0;
        return salB - salA;
      });
      case 'salary_low': return sorted.sort((a, b) => {
        const salA = a.salary ? parseFloat(a.salary.replace(/[^0-9.-]/g, '').split('-')[0] || '999') : 999;
        const salB = b.salary ? parseFloat(b.salary.replace(/[^0-9.-]/g, '').split('-')[0] || '999') : 999;
        return salA - salB;
      });
      default:
        if (debouncedSearchTerm) return sorted.sort((a, b) => (b.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 1 : 0) - (a.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 1 : 0));
        return sorted;
    }
  }, [jobs, sortBy, debouncedSearchTerm]);

  const handleSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); setPage(1); setShowSearchHistory(false); fetchJobs(); };
  const resetFilters = () => { setSearchTerm(''); setLocationFilter(''); setPage(1); setSortBy('recent'); };
  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  if (initialLoad && loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Next Job</h1><p className="text-gray-600 dark:text-gray-400">Browse through our collection of opportunities</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-pulse"><div className="grid grid-cols-1 md:grid-cols-12 gap-4"><div className="md:col-span-5 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div><div className="md:col-span-4 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div><div className="md:col-span-3 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 12 }).map((_, i) => <JobCardSkeleton key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Next Job</h1><p className="text-gray-600 dark:text-gray-400">Browse through our collection of opportunities</p></div>
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Job title, keywords, or company" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)} onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)} autoComplete="off" />
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent</span><button type="button" onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">Clear</button></div>
                {searchHistory.slice(0, 5).map((term, i) => (<div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group" onClick={() => { setSearchTerm(term); setPage(1); setShowSearchHistory(false); }}><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{term}</span></div><button type="button" onClick={(e) => { e.stopPropagation(); removeFromHistory(term); }} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button></div>))}
              </div>
            )}
          </div>
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="City, state, or remote" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button type="button" className={`flex-1 px-4 py-3 border rounded-lg flex items-center justify-center gap-2 ${isFiltersOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`} onClick={() => setIsFiltersOpen(!isFiltersOpen)}><SlidersHorizontal className="h-5 w-5" /><span className="hidden sm:inline">Filters</span></button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50" disabled={loading}>{loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search className="h-5 w-5" />}<span className="hidden sm:inline">Search</span></button>
          </div>
        </div>
        {isFiltersOpen && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">{SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              {(searchTerm || locationFilter) && <button type="button" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center gap-1" onClick={resetFilters}><Trash2 className="h-4 w-4" />Reset</button>}
            </div>
          </div>
        )}
        {(searchTerm || locationFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Keyword: {searchTerm}<button type="button" className="ml-2 hover:bg-blue-200 rounded-full p-1" onClick={() => setSearchTerm('')}><X className="h-3 w-3" /></button></span>}
            {locationFilter && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Location: {locationFilter}<button type="button" className="ml-2 hover:bg-green-200 rounded-full p-1" onClick={() => setLocationFilter('')}><X className="h-3 w-3" /></button></span>}
          </div>
        )}
      </form>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"><div className="flex items-center"><AlertCircle className="h-5 w-5 text-red-500 mr-2" /><p className="text-red-800 dark:text-red-200">{error}</p><button onClick={fetchJobs} className="ml-4 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded text-sm hover:bg-red-200"><RefreshCw className="h-4 w-4 inline mr-1" />Retry</button></div></div>}
      {!loading && !error && <p className="text-gray-600 dark:text-gray-400 mb-6">Showing <span className="font-semibold">{sortedJobs.length}</span> of <span className="font-semibold">{totalJobs.toLocaleString()}</span> jobs{totalPages > 1 && ` • Page ${page} of ${totalPages}`}</p>}
      {sortedJobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sortedJobs.map(job => <JobCard key={job.id} job={job} />)}</div>
          {totalPages > 1 && (
            <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <div className="text-gray-600 dark:text-gray-400 text-sm">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-1">
                <button type="button" className={`p-2 rounded-lg ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => handlePageChange(1)} disabled={page === 1}><ChevronsLeft className="h-5 w-5" /></button>
                <button type="button" className={`p-2 rounded-lg ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => handlePageChange(page - 1)} disabled={page === 1}><ChevronLeft className="h-5 w-5" /></button>
                <div className="flex items-center gap-1">{getPageNumbers.map((p, i) => p === '...' ? <span key={i} className="px-2 text-gray-400">...</span> : <button key={i} type="button" className={`w-10 h-10 rounded-lg font-medium ${page === p ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => handlePageChange(p as number)}>{p}</button>)}</div>
                <button type="button" className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}><ChevronRight className="h-5 w-5" /></button>
                <button type="button" className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-5 w-5" /></button>
              </div>
            </nav>
          )}
        </>
      ) : !loading && !error ? (
        <div className="text-center py-12"><div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl max-w-md mx-auto"><Search className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3><p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search criteria</p><button onClick={resetFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Reset Filters</button></div></div>
      ) : null}
      {loading && !initialLoad && <div className="text-center mt-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
    </div>
  );
};

export default JobsPage;