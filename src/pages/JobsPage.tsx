import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, AlertCircle, RefreshCw, SlidersHorizontal, X, Clock, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, LayoutGrid, List, Sparkles } from 'lucide-react';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import SkillsAutocomplete from '../components/SkillsAutocomplete';
import AdvancedFilters, { AdvancedFiltersState } from '../components/AdvancedFilters';
import { api, Job, SearchJobsParams } from '../services/api';
import { useDebounce, useSearchHistory, useKeyboardShortcuts } from '../hooks/useSearch';

type SortOption = 'recent' | 'relevant' | 'salary_high' | 'salary_low';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'salary_high', label: 'Salary: High to Low' },
  { value: 'salary_low', label: 'Salary: Low to High' }
];

const defaultFilters: AdvancedFiltersState = {
  jobTypes: [], experienceLevels: [], datePosted: 'all', salaryRange: '', workSettings: [], industries: [], distance: 25
};

const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState(() => searchParams.get('location') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    const skillsParam = searchParams.get('skills');
    return skillsParam ? skillsParam.split(',').filter(Boolean) : [];
  });
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sortBy') as SortOption) || 'recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [filters, setFilters] = useState<AdvancedFiltersState>(() => {
    const stored = localStorage.getItem('jobnext-filters');
    if (stored) { try { return { ...defaultFilters, ...JSON.parse(stored) }; } catch {} }
    return defaultFilters;
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  useKeyboardShortcuts([{ key: 'Escape', handler: () => { setShowSearchHistory(false); setShowMobileFilters(false); } }]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.jobTypes.length > 0) count += filters.jobTypes.length;
    if (filters.experienceLevels.length > 0) count += filters.experienceLevels.length;
    if (filters.datePosted !== 'all') count += 1;
    if (filters.salaryRange) count += 1;
    if (filters.workSettings.length > 0) count += filters.workSettings.length;
    if (selectedSkills.length > 0) count += selectedSkills.length;
    return count;
  }, [filters, selectedSkills]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (debouncedLocation) params.set('location', debouncedLocation);
    if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
    if (page > 1) params.set('page', page.toString());
    if (sortBy !== 'recent') params.set('sortBy', sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, debouncedLocation, selectedSkills, page, sortBy, setSearchParams]);

  useEffect(() => { localStorage.setItem('jobnext-filters', JSON.stringify(filters)); }, [filters]);

  const buildSearchParams = useCallback((): SearchJobsParams => ({
    search: debouncedSearchTerm || undefined,
    location: debouncedLocation || undefined,
    page, limit: 12, sortBy,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    jobTypes: filters.jobTypes.length > 0 ? filters.jobTypes : undefined,
    experienceLevels: filters.experienceLevels.length > 0 ? filters.experienceLevels : undefined,
    datePosted: filters.datePosted !== 'all' ? filters.datePosted : undefined,
    salaryRange: filters.salaryRange || undefined,
    workSettings: filters.workSettings.length > 0 ? filters.workSettings : undefined,
  }), [debouncedSearchTerm, debouncedLocation, page, sortBy, selectedSkills, filters]);

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = buildSearchParams();
      const response = await api.searchJobs(params);
      if (debouncedSearchTerm && page === 1) addToHistory(debouncedSearchTerm);
      let filteredJobs = response.jobs;
      if (selectedSkills.length > 0 || filters.jobTypes.length > 0 || filters.experienceLevels.length > 0 || filters.workSettings.length > 0 || filters.datePosted !== 'all') {
        filteredJobs = api.filterJobsClientSide(response.jobs, params);
      }
      setJobs(filteredJobs); setTotalPages(response.totalPages); setTotalJobs(response.total); setInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally { setLoading(false); }
  }, [buildSearchParams, debouncedSearchTerm, page, addToHistory, selectedSkills, filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const sortedJobs = useMemo(() => {
    if (!jobs?.length) return [];
    const sorted = [...jobs];
    switch (sortBy) {
      case 'recent': return sorted.sort((a, b) => b.posted_date - a.posted_date);
      case 'salary_high': return sorted.sort((a, b) => { const sA = a.salaryMax || (a.salary ? parseFloat(a.salary.replace(/[^0-9.-]/g, '').split('-')[1] || '0') : 0); const sB = b.salaryMax || (b.salary ? parseFloat(b.salary.replace(/[^0-9.-]/g, '').split('-')[1] || '0') : 0); return sB - sA; });
      case 'salary_low': return sorted.sort((a, b) => { const sA = a.salaryMin || (a.salary ? parseFloat(a.salary.replace(/[^0-9.-]/g, '').split('-')[0] || '0') : Infinity); const sB = b.salaryMin || (b.salary ? parseFloat(b.salary.replace(/[^0-9.-]/g, '').split('-')[0] || '0') : Infinity); return sA - sB; });
      case 'relevant': default: if (debouncedSearchTerm) return sorted.sort((a, b) => { const t = debouncedSearchTerm.toLowerCase(); return (b.title.toLowerCase().includes(t) ? 1 : 0) - (a.title.toLowerCase().includes(t) ? 1 : 0); }); return sorted;
    }
  }, [jobs, sortBy, debouncedSearchTerm]);

  const handleSearch = (e?: React.FormEvent) => { if (e) e.preventDefault(); setPage(1); setShowSearchHistory(false); fetchJobs(); };
  const resetFilters = () => { setSearchTerm(''); setLocationFilter(''); setSelectedSkills([]); setFilters(defaultFilters); setPage(1); setSortBy('recent'); };
  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleHistoryClick = (term: string) => { setSearchTerm(term); setPage(1); setShowSearchHistory(false); };

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else { pages.push(1); if (page > 3) pages.push('...'); for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i); if (page < totalPages - 2) pages.push('...'); pages.push(totalPages); }
    return pages;
  }, [page, totalPages]);

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Next Job</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Browse through our collection of opportunities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 12 }).map((_, i) => <JobCardSkeleton key={i} />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Your Next Job</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Discover opportunities that match your skills</p>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className={`${showFilters ? 'lg:w-80' : 'lg:w-0'} hidden lg:block transition-all duration-300`}>
            {showFilters && (
              <div className="sticky top-24 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" />Skills & Technologies</h3>
                  <SkillsAutocomplete selectedSkills={selectedSkills} onSkillsChange={setSelectedSkills} maxSkills={10} />
                </div>
                <AdvancedFilters filters={filters} onFilterChange={setFilters} onReset={() => setFilters(defaultFilters)} activeFilterCount={activeFilterCount - selectedSkills.length} />
              </div>
            )}
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" placeholder="Job title, keywords, or company" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)} onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)} />
                  {showSearchHistory && searchHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500">Recent</span>
                        <button type="button" onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
                      </div>
                      {searchHistory.slice(0, 5).map((term, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group" onClick={() => handleHistoryClick(term)}>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{term}</span></div>
                          <button type="button" onClick={e => { e.stopPropagation(); removeFromHistory(term); }} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" placeholder="City, state, or remote" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <button type="button" className="lg:hidden flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300" onClick={() => setShowMobileFilters(true)}>
                    <Filter className="h-5 w-5" />Filters{activeFilterCount > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{activeFilterCount}</span>}
                  </button>
                  <button type="button" className="hidden lg:flex px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg items-center justify-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal className="h-5 w-5" /></button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50" disabled={loading}>
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Search className="h-5 w-5" />}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">{SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  </div>
                  <div className="hidden md:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button type="button" onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600'}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600'}`}><List className="h-4 w-4" /></button>
                  </div>
                </div>
                {activeFilterCount > 0 && <button type="button" onClick={resetFilters} className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="h-4 w-4" />Clear all ({activeFilterCount})</button>}
              </div>
              {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">{selectedSkills.map(s => <span key={s} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">{s}<button type="button" onClick={() => setSelectedSkills(selectedSkills.filter(x => x !== s))} className="ml-2 hover:bg-purple-200 rounded-full p-0.5"><X className="h-3 w-3" /></button></span>)}</div>
              )}
            </form>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start"><AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" /><div><p className="text-red-800 dark:text-red-200 font-medium">Error loading jobs</p><p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p><button type="button" className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded text-sm flex items-center" onClick={fetchJobs}><RefreshCw className="h-4 w-4 mr-1" />Try Again</button></div></div>
              </div>
            )}
            {!loading && !error && <p className="text-gray-600 dark:text-gray-400 mb-6">Showing <span className="font-semibold text-gray-900 dark:text-white">{sortedJobs.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalJobs?.toLocaleString() || 0}</span> jobs{totalPages > 1 && <span> • Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span></span>}</p>}
            {sortedJobs.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>{sortedJobs.map(job => <JobCard key={job.id} job={job} viewMode={viewMode} />)}</div>
                {totalPages > 1 && (
                  <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
                    <div className="text-gray-600 dark:text-gray-400 text-sm">Page {page} of {totalPages}</div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handlePageChange(1)} disabled={page === 1} className={`p-2 rounded-lg ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronsLeft className="h-5 w-5" /></button>
                      <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className={`p-2 rounded-lg ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronLeft className="h-5 w-5" /></button>
                      <div className="flex items-center gap-1">{getPageNumbers.map((p, i) => p === '...' ? <span key={i} className="px-2 text-gray-400">...</span> : <button key={i} type="button" onClick={() => handlePageChange(p as number)} className={`w-10 h-10 rounded-lg font-medium ${page === p ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{p}</button>)}</div>
                      <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronRight className="h-5 w-5" /></button>
                      <button type="button" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><ChevronsRight className="h-5 w-5" /></button>
                    </div>
                  </nav>
                )}
              </>
            ) : !loading && !error ? (
              <div className="text-center py-12"><div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl max-w-md mx-auto"><Search className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3><p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search criteria</p><button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={resetFilters}>Reset Filters</button></div></div>
            ) : null}
            {loading && !initialLoad && <div className="text-center mt-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}
          </main>
        </div>
        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button type="button" onClick={() => setShowMobileFilters(false)} className="p-2 text-gray-600 dark:text-gray-400"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Skills</h3>
                  <SkillsAutocomplete selectedSkills={selectedSkills} onSkillsChange={setSelectedSkills} maxSkills={10} />
                </div>
                <AdvancedFilters filters={filters} onFilterChange={setFilters} onReset={() => setFilters(defaultFilters)} activeFilterCount={activeFilterCount - selectedSkills.length} />
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <button type="button" onClick={() => { setShowMobileFilters(false); fetchJobs(); }} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Apply Filters</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
