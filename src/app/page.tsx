'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Building2, Clock, DollarSign, Bookmark, ExternalLink, Star, TrendingUp, Users, ChevronRight, Filter, X, Sparkles, Heart } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary?: string
  posted_date: string
  source: string
  is_remote: boolean
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('savedJobs')
    if (saved) setSavedJobs(JSON.parse(saved))
    // Load initial jobs
    searchJobs(true)
  }, [])

  const searchJobs = async (initial = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search || initial) {
        if (search) params.append('search', search)
      }
      if (location) params.append('location', location)
      params.append('limit', '20')
      
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = (job: Job) => {
    const isSaved = savedJobs.some(j => j.id === job.id)
    const updated = isSaved 
      ? savedJobs.filter(j => j.id !== job.id)
      : [...savedJobs, job]
    setSavedJobs(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recently posted'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return date.toLocaleDateString()
  }

  const stats = [
    { label: 'Jobs Available', value: '10,000+', icon: Briefcase },
    { label: 'Companies', value: '5,000+', icon: Building2 },
    { label: 'Remote Jobs', value: '3,500+', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">NextJob</h1>
                <p className="text-blue-200 text-sm">AI-Powered Career Platform</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'search' ? 'bg-white text-blue-700' : 'text-white/80 hover:bg-white/10'}`}
              >
                Find Jobs
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'saved' ? 'bg-white text-blue-700' : 'text-white/80 hover:bg-white/10'}`}
              >
                <Bookmark className="w-4 h-4" />
                Saved ({savedJobs.length})
              </button>
            </nav>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-gray-800 text-lg"
                />
              </div>
              <div className="relative w-full md:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-gray-800 text-lg"
                />
              </div>
              <button
                onClick={() => searchJobs()}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Remote', 'Full-time', 'Part-time', 'Contract', 'Developer', 'Designer', 'Marketing'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setSearch(filter); searchJobs(); }}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full text-sm font-medium text-gray-600 transition"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'search' ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {loading ? 'Searching...' : `${jobs.length} Jobs Found`}
                </h2>
                <p className="text-gray-500 text-sm">From Remotive, Arbeitnow, and more</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Job Cards */}
            <div className="grid gap-4 lg:grid-cols-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition cursor-pointer group"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      job.source === 'Remotive' ? 'bg-green-100 text-green-700' :
                      job.source === 'Arbeitnow' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.source}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(job.posted_date)}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.is_remote && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                        🏠 Remote
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      Full-time
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{job.description}</p>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(job); }}
                      className={`p-2 rounded-lg transition ${savedJobs.some(j => j.id === job.id) ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${savedJobs.some(j => j.id === job.id) ? 'fill-current' : ''}`} />
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {jobs.length === 0 && !loading && (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </>
        ) : (
          /* Saved Jobs Tab */
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Saved Jobs ({savedJobs.length})
            </h2>
            {savedJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved jobs yet</h3>
                <p className="text-gray-500">Click the heart icon on any job to save it for later</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {savedJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm border border-blue-100 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                      </div>
                      <button
                        onClick={() => toggleSave(job)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
                    >
                      Apply Now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedJob.company.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-gray-600">{selectedJob.company}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedJob.is_remote && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    🏠 Remote
                  </span>
                )}
                {selectedJob.salary && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    💰 {selectedJob.salary}
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {selectedJob.source}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <div className="text-gray-600 text-sm whitespace-pre-line bg-gray-50 rounded-lg p-4">
                {selectedJob.description}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => toggleSave(selectedJob)}
                  className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                    savedJobs.some(j => j.id === selectedJob.id)
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${savedJobs.some(j => j.id === selectedJob.id) ? 'fill-current' : ''}`} />
                  {savedJobs.some(j => j.id === selectedJob.id) ? 'Saved' : 'Save'}
                </button>
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 text-center flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>NextJob - AI-Powered Career Platform</p>
          <p className="mt-1">Data from Remotive, Arbeitnow, JSearch & Adzuna</p>
        </div>
      </footer>
    </div>
  )
}
