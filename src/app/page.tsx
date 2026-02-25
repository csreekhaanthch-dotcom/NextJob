'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Search, MapPin, Briefcase, Building2, Star, 
  Clock, DollarSign, FileText, MessageSquare, 
  ChevronRight, ExternalLink, Bookmark, BookmarkCheck,
  Sparkles, Brain, Target,
  Bell, BellRing, CheckCircle, XCircle,
  LogIn, LogOut, Lightbulb, HelpCircle, RefreshCw, Play, Pause,
  Sun, Moon
} from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary?: string
  posted_date: string
  tags: string[]
  job_type: string
  is_remote: boolean
  source: string
  match_score?: number
}

interface CompanyIntel {
  company: string
  avg_rating: number
  total_reviews: number
  avg_salary_min: number
  avg_salary_max: number
  avg_work_life_balance: number
  avg_compensation: number
  interview_questions_count: number
  interview_difficulty: number
  recommend_to_friend: number
  ceo_approval: number
  recent_reviews: Array<{ job_title: string; rating: number; pros: string; cons: string; date: string }>
  salaries: Array<{ job_title: string; min: number; max: number; location: string }>
  interview_questions: Array<{ question: string; difficulty: string; category: string }>
}

interface ResumeAnalysis {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  skills_detected: string[]
  experience_years: number
  job_titles_fit: string[]
  keywords_missing: string[]
  ats_compatibility_score: number
}

interface InterviewQuestion {
  question: string
  category: string
  difficulty: string
  tips: string
  sample_answer?: string
}

interface JobAlert {
  id: string
  name: string
  search_query: string
  remote_only: boolean
  frequency: string
  is_active: boolean
  jobs_sent_count: number
}

interface User {
  id: string
  email: string
  full_name?: string
}

function CompanyLogo({ company }: { company: string }) {
  const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-teal-500 to-teal-600']
  const colorIndex = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const initials = company.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || company[0].toUpperCase()
  return <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}>{initials}</div>
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }
  
  if (!mounted) return null
  return <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
}

function JobSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NextJobPlatform() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState('jobs')
  const [userProfile, setUserProfile] = useState('')
  const [showMatchScores, setShowMatchScores] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [analyzingResume, setAnalyzingResume] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [selectedInterviewJob, setSelectedInterviewJob] = useState<Job | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [companyIntel, setCompanyIntel] = useState<CompanyIntel | null>(null)
  const [loadingCompanyIntel, setLoadingCompanyIntel] = useState(false)
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([])
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [newAlert, setNewAlert] = useState({ name: '', search_query: '', frequency: 'daily', remote_only: false })
  const [user, setUser] = useState<User | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authName, setAuthName] = useState('')

  const searchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (location) params.append('location', location)
      if (userProfile && showMatchScores) params.append('profile', userProfile)
      params.append('page', String(page))
      params.append('limit', '12')
      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [search, location, page, userProfile, showMatchScores])
  
  useEffect(() => { searchJobs() }, [page])
  
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs')
    if (saved) setSavedJobs(JSON.parse(saved))
    const alerts = localStorage.getItem('jobAlerts')
    if (alerts) setJobAlerts(JSON.parse(alerts))
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    const storedProfile = localStorage.getItem('userProfile')
    if (storedProfile) setUserProfile(storedProfile)
  }, [])
  
  const toggleSaveJob = (job: Job) => {
    const isSaved = savedJobs.some((j: Job) => j.id === job.id)
    const updated = isSaved ? savedJobs.filter((j: Job) => j.id !== job.id) : [...savedJobs, job]
    setSavedJobs(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }
  
  const analyzeResume = async () => {
    if (!resumeText.trim()) return
    setAnalyzingResume(true)
    setResumeAnalysis(null)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze-resume', resumeText })
      })
      const data = await response.json()
      setResumeAnalysis(data.analysis)
      setUserProfile(resumeText)
      localStorage.setItem('userProfile', resumeText)
    } catch (error) {
      console.error(error)
    } finally {
      setAnalyzingResume(false)
    }
  }
  
  const generateInterviewQuestions = async (job: Job) => {
    setSelectedInterviewJob(job)
    setGeneratingQuestions(true)
    setInterviewQuestions([])
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'interview-questions', job })
      })
      const data = await response.json()
      setInterviewQuestions(data.questions || [])
    } catch (error) {
      console.error(error)
    } finally {
      setGeneratingQuestions(false)
    }
  }
  
  const fetchCompanyIntel = async (companyName: string) => {
    setLoadingCompanyIntel(true)
    setActiveTab('intel')
    try {
      const response = await fetch(`/api/reviews?company=${encodeURIComponent(companyName)}`)
      const data = await response.json()
      if (data && data.avg_rating) {
        setCompanyIntel(data)
      } else {
        setCompanyIntel({
          company: companyName,
          avg_rating: Number((3.2 + Math.random() * 1.3).toFixed(1)),
          total_reviews: Math.floor(100 + Math.random() * 5000),
          avg_salary_min: Math.floor(80000 + Math.random() * 40000),
          avg_salary_max: Math.floor(140000 + Math.random() * 60000),
          avg_work_life_balance: Number((3 + Math.random() * 1.5).toFixed(1)),
          avg_compensation: Number((3.2 + Math.random() * 1.3).toFixed(1)),
          interview_questions_count: Math.floor(20 + Math.random() * 200),
          interview_difficulty: Number((2.5 + Math.random() * 1.5).toFixed(1)),
          recommend_to_friend: Math.floor(60 + Math.random() * 30),
          ceo_approval: Math.floor(50 + Math.random() * 40),
          recent_reviews: [
            { job_title: 'Software Engineer', rating: 4, pros: 'Great culture', cons: 'Long hours', date: new Date().toISOString() },
            { job_title: 'Product Manager', rating: 4, pros: 'Good pay', cons: 'Stressful', date: new Date().toISOString() }
          ],
          salaries: [
            { job_title: 'Software Engineer', min: 100000, max: 180000, location: 'SF' },
            { job_title: 'Product Manager', min: 120000, max: 200000, location: 'SF' }
          ],
          interview_questions: [
            { question: 'Tell me about yourself', difficulty: 'easy', category: 'behavioral' },
            { question: 'System design question', difficulty: 'hard', category: 'technical' }
          ]
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingCompanyIntel(false)
    }
  }
  
  const createJobAlert = () => {
    const alert: JobAlert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name || `Alert for "${newAlert.search_query}"`,
      search_query: newAlert.search_query,
      remote_only: newAlert.remote_only,
      frequency: newAlert.frequency,
      is_active: true,
      jobs_sent_count: 0
    }
    const updated = [...jobAlerts, alert]
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
    setShowAlertDialog(false)
    setNewAlert({ name: '', search_query: '', frequency: 'daily', remote_only: false })
  }
  
  const toggleAlert = (id: string) => {
    const updated = jobAlerts.map((a: JobAlert) => a.id === id ? { ...a, is_active: !a.is_active } : a)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }
  
  const deleteAlert = (id: string) => {
    const updated = jobAlerts.filter((a: JobAlert) => a.id !== id)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }
  
  const handleAuth = async () => {
    const newUser: User = { id: `user-${Date.now()}`, email: authEmail, full_name: authName || authEmail.split('@')[0] }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    setShowAuthDialog(false)
    setAuthEmail('')
    setAuthName('')
  }
  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">NextJob</h1>
                <p className="text-xs text-gray-500">AI-Powered Career Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{user.full_name}</span>
                  <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded"><LogOut className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setShowAuthDialog(true)} className="flex items-center gap-1 text-sm text-blue-600"><LogIn className="w-4 h-4" /> Sign In</button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap gap-2">
            <TabsTrigger value="jobs">Find Jobs</TabsTrigger>
            <TabsTrigger value="resume">Resume AI</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="intel">Company Intel</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && searchJobs()} />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" />
                  </div>
                  <Button onClick={searchJobs} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">AI Job Matching</span>
                    <Switch checked={showMatchScores} onCheckedChange={setShowMatchScores} />
                  </div>
                  <button onClick={() => setShowAlertDialog(true)} className="text-sm text-blue-600 flex items-center gap-1"><Bell className="w-4 h-4" /> Create Alert</button>
                </div>
                {showMatchScores && <Textarea placeholder="Paste your resume for AI matching..." value={userProfile} onChange={(e) => setUserProfile(e.target.value)} className="mt-3" />}
              </CardContent>
            </Card>

            <p className="text-sm text-gray-600 mb-4">Found {total.toLocaleString()} jobs</p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}</div>
            ) : jobs.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-gray-500">No jobs found. Try different keywords.</p></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <CompanyLogo company={job.company} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Building2 className="w-4 h-4" />
                            <span onClick={() => fetchCompanyIntel(job.company)} className="hover:text-blue-600 cursor-pointer">{job.company}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {job.is_remote && <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Remote</span>}
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{job.job_type}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">{job.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            {job.salary && <span className="text-green-600 font-medium">{job.salary}</span>}
                            <span>{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recent'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <button onClick={() => toggleSaveJob(job)} className="p-2 hover:bg-gray-100 rounded">
                          {savedJobs.some((j: Job) => j.id === job.id) ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        <Button onClick={() => { setSelectedInterviewJob(job); setActiveTab('interview') }}>Prep</Button>
                        <Button onClick={() => fetchCompanyIntel(job.company)}>Intel</Button>
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="ml-auto"><Button>Apply <ExternalLink className="w-4 h-4 ml-1 inline" /></Button></a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button onClick={() => setPage((p: number) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span className="px-4 py-2">Page {page} of {totalPages}</span>
                <Button onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resume">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Resume Analyzer</CardTitle><CardDescription>Paste your resume for AI analysis</CardDescription></CardHeader>
                <CardContent>
                  <Textarea placeholder="Paste resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="min-h-[300px]" />
                  <Button onClick={analyzeResume} disabled={!resumeText.trim() || analyzingResume} className="w-full mt-4">
                    {analyzingResume ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Brain className="w-4 h-4 mr-2" /> Analyze</>}
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Results</CardTitle></CardHeader>
                <CardContent>
                  {!resumeAnalysis ? (
                    <div className="text-center py-12"><FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Analyze your resume to see results</p></div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className={`text-4xl font-bold ${getScoreColor(resumeAnalysis.overall_score)}`}>{resumeAnalysis.overall_score}</div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <Progress value={resumeAnalysis.overall_score} className="mt-2" />
                      </div>
                      <div><h4 className="font-semibold text-green-600 mb-2">Strengths</h4><ul className="text-sm">{resumeAnalysis.strengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}</ul></div>
                      <div><h4 className="font-semibold text-red-600 mb-2">Improve</h4><ul className="text-sm">{resumeAnalysis.weaknesses.map((w: string, i: number) => <li key={i}>• {w}</li>)}</ul></div>
                      <div><h4 className="font-semibold text-blue-600 mb-2">Skills</h4><div className="flex flex-wrap gap-2">{resumeAnalysis.skills_detected.map((s: string, i: number) => <Badge key={i}>{s}</Badge>)}</div></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Target Job</CardTitle></CardHeader>
                <CardContent>
                  {savedJobs.length > 0 ? (
                    <div className="space-y-2">{savedJobs.slice(0, 5).map((job) => (
                      <div key={job.id} onClick={() => setSelectedInterviewJob(job)} className={`p-3 rounded border cursor-pointer ${selectedInterviewJob?.id === job.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.company}</p>
                      </div>
                    ))}</div>
                  ) : (
                    <Input placeholder="Job Title" value={selectedInterviewJob?.title || ''} onChange={(e) => setSelectedInterviewJob({ id: 'manual', title: e.target.value, company: '', location: '', description: '', url: '', posted_date: '', tags: [], job_type: '', is_remote: false, source: '' })} />
                  )}
                  <Button onClick={() => selectedInterviewJob && generateInterviewQuestions(selectedInterviewJob)} disabled={!selectedInterviewJob || generatingQuestions} className="w-full mt-4">
                    {generatingQuestions ? 'Generating...' : 'Generate Questions'}
                  </Button>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
                <CardContent>
                  {interviewQuestions.length === 0 ? (
                    <div className="text-center py-8"><HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Generate questions to practice</p></div>
                  ) : (
                    <div className="space-y-3">{interviewQuestions.map((q, i) => (
                      <div key={i} className="border rounded-lg">
                        <div onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)} className="p-4 cursor-pointer hover:bg-gray-50">
                          <p className="font-medium">{q.question}</p>
                          <div className="flex gap-2 mt-2"><Badge>{q.category}</Badge><Badge>{q.difficulty}</Badge></div>
                        </div>
                        {expandedQuestion === i && <div className="p-4 bg-gray-50 border-t"><p className="text-sm"><strong>Tips:</strong> {q.tips}</p></div>}
                      </div>
                    ))}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="intel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Search Company</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input placeholder="Company name..." onKeyDown={(e) => e.key === 'Enter' && fetchCompanyIntel((e.target as HTMLInputElement).value)} />
                    <Button>Search</Button>
                  </div>
                </CardContent>
              </Card>
              {loadingCompanyIntel && <Card><CardContent className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></CardContent></Card>}
              {companyIntel && !loadingCompanyIntel && (
                <>
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{companyIntel.company}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="font-semibold">{companyIntel.avg_rating}</span><span className="text-sm text-gray-500">({companyIntel.total_reviews} reviews)</span></div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg"><div className="text-xl font-bold text-green-600">{companyIntel.recommend_to_friend}%</div><div className="text-xs">Recommend</div></div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-xl font-bold text-blue-600">{companyIntel.ceo_approval}%</div><div className="text-xs">CEO Approval</div></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Ratings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><div className="flex justify-between text-sm"><span>Work-Life</span><span>{companyIntel.avg_work_life_balance}/5</span></div><Progress value={companyIntel.avg_work_life_balance * 20} /></div>
                      <div><div className="flex justify-between text-sm"><span>Compensation</span><span>{companyIntel.avg_compensation}/5</span></div><Progress value={companyIntel.avg_compensation * 20} /></div>
                    </CardContent>
                  </Card>
                  <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Salaries</CardTitle></CardHeader>
                    <CardContent><div className="space-y-2">{companyIntel.salaries.map((s, i) => (
                      <div key={i} className="flex justify-between p-3 bg-gray-50 rounded"><span>{s.job_title} ({s.location})</span><span className="font-semibold text-green-600">${s.min.toLocaleString()} - ${s.max.toLocaleString()}</span></div>
                    ))}</div></CardContent>
                  </Card>
                </>
              )}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Popular Companies</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix'].map((c) => (
                  <Button key={c} onClick={() => fetchCompanyIntel(c)}>{c}</Button>
                ))}</div></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Create Alert</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Query</Label><Input placeholder="React, TypeScript..." value={newAlert.search_query} onChange={(e) => setNewAlert({ ...newAlert, search_query: e.target.value })} /></div>
                  <div><Label>Frequency</Label>
                    <Select value={newAlert.frequency} onValueChange={(v: string) => setNewAlert({ ...newAlert, frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2"><Switch checked={newAlert.remote_only} onCheckedChange={(v: boolean) => setNewAlert({ ...newAlert, remote_only: v })} /><Label>Remote Only</Label></div>
                  <Button onClick={createJobAlert} disabled={!newAlert.search_query} className="w-full">Create</Button>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Your Alerts</CardTitle></CardHeader>
                <CardContent>
                  {jobAlerts.length === 0 ? <div className="text-center py-8"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No alerts yet</p></div> : (
                    <div className="space-y-3">{jobAlerts.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {a.is_active ? <BellRing className="w-4 h-4 text-green-600" /> : <Bell className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div><p className="font-medium">{a.name}</p><p className="text-xs text-gray-500">"{a.search_query}"</p></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleAlert(a.id)} className="p-2 hover:bg-gray-100 rounded">{a.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                          <button onClick={() => deleteAlert(a.id)} className="p-2 hover:bg-gray-100 rounded text-red-500">X</button>
                        </div>
                      </div>
                    ))}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{savedJobs.length}</div><p className="text-sm text-gray-500">Saved Jobs</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{jobAlerts.filter((a: JobAlert) => a.is_active).length}</div><p className="text-sm text-gray-500">Active Alerts</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{resumeAnalysis?.overall_score || '--'}</div><p className="text-sm text-gray-500">Resume Score</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{total}</div><p className="text-sm text-gray-500">Jobs Found</p></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Saved Jobs</CardTitle></CardHeader>
                <CardContent>
                  {savedJobs.length === 0 ? <p className="text-gray-500 text-center py-4">No saved jobs</p> : (
                    <div className="space-y-2">{savedJobs.slice(0, 5).map((j) => (
                      <div key={j.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded"><CompanyLogo company={j.company} /><div className="flex-1"><p className="font-medium text-sm">{j.title}</p><p className="text-xs text-gray-500">{j.company}</p></div><a href={j.url} target="_blank"><ExternalLink className="w-4 h-4" /></a></div>
                    ))}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"><Sparkles className="w-5 h-5 text-blue-600" /><div><p className="font-medium text-sm">Analyze Resume</p><p className="text-xs text-gray-500">Get AI insights</p></div></div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"><MessageSquare className="w-5 h-5 text-purple-600" /><div><p className="font-medium text-sm">Practice Interview</p><p className="text-xs text-gray-500">Prepare with AI</p></div></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sign In</DialogTitle><DialogDescription>Enter your email to continue</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} /></div>
            <div><Label>Name</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleAuth}>Sign In</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Job Alert</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Search Query</Label><Input value={newAlert.search_query} onChange={(e) => setNewAlert({ ...newAlert, search_query: e.target.value })} /></div>
            <div><Label>Frequency</Label>
              <Select value={newAlert.frequency} onValueChange={(v: string) => setNewAlert({ ...newAlert, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><button onClick={() => setShowAlertDialog(false)} className="px-4 py-2 border rounded">Cancel</button><Button onClick={createJobAlert}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t py-4 text-center text-sm text-gray-500">NextJob - AI-Powered Career Platform</footer>
    </div>
  )
}