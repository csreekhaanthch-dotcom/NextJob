'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Alert } from '@/components/ui/alert'
import { 
  Search, MapPin, Briefcase, Building2, Star, 
  Clock, DollarSign, FileText, MessageSquare, 
  ChevronRight, ExternalLink, Bookmark, BookmarkCheck,
  Sparkles, Brain, Target, Upload, Download,
  Bell, BellRing, Mail, CheckCircle, XCircle, AlertTriangle,
  User, LogIn, LogOut, Lightbulb, HelpCircle, RefreshCw, Play, Pause
} from 'lucide-react'

// Types
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
  recent_reviews: Array<{
    job_title: string
    rating: number
    pros: string
    cons: string
    date: string
  }>
  salaries: Array<{
    job_title: string
    min: number
    max: number
    location: string
  }>
  interview_questions: Array<{
    question: string
    difficulty: string
    category: string
  }>
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
  location?: string
  job_type?: string
  min_salary?: number
  remote_only: boolean
  frequency: string
  is_active: boolean
  last_sent?: string
  jobs_sent_count: number
}

interface User {
  id: string
  email: string
  full_name?: string
}

export default function NextJobPlatform() {
  // State
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState('jobs')
  
  // AI Features
  const [userProfile, setUserProfile] = useState('')
  const [showMatchScores, setShowMatchScores] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false)
  
  // Resume Analyzer
  const [resumeText, setResumeText] = useState('')
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [analyzingResume, setAnalyzingResume] = useState(false)
  
  // Interview Prep
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [selectedInterviewJob, setSelectedInterviewJob] = useState<Job | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  
  // Applications
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<any[]>([])
  
  // Company Intel
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [companyIntel, setCompanyIntel] = useState<CompanyIntel | null>(null)
  const [loadingCompanyIntel, setLoadingCompanyIntel] = useState(false)
  
  // Job Alerts
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([])
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [newAlert, setNewAlert] = useState<Partial<JobAlert>>({
    name: '',
    search_query: '',
    frequency: 'daily',
    remote_only: false
  })
  
  // Auth
  const [user, setUser] = useState<User | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  // Search jobs
  const searchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (location) params.append('location', location)
      if (userProfile && showMatchScores) params.append('profile', userProfile)
      params.append('page', String(page))
      params.append('limit', '12')
      
      const response = await fetch(\`/api/jobs?\${params.toString()}\`)
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
  
  useEffect(() => {
    searchJobs()
  }, [page])
  
  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs')
    if (saved) setSavedJobs(JSON.parse(saved))
    
    const apps = localStorage.getItem('applications')
    if (apps) setApplications(JSON.parse(apps))
    
    const alerts = localStorage.getItem('jobAlerts')
    if (alerts) setJobAlerts(JSON.parse(alerts))
    
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    
    const storedProfile = localStorage.getItem('userProfile')
    if (storedProfile) setUserProfile(storedProfile)
  }, [])
  
  // Save job
  const toggleSaveJob = (job: Job) => {
    const isSaved = savedJobs.some(j => j.id === job.id)
    let updated: Job[]
    
    if (isSaved) {
      updated = savedJobs.filter(j => j.id !== job.id)
    } else {
      updated = [...savedJobs, job]
    }
    
    setSavedJobs(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }
  
  // Generate cover letter
  const generateCoverLetter = async (job: Job) => {
    if (!userProfile) {
      alert('Please enter your profile/resume first to generate a cover letter')
      return
    }
    
    setGeneratingCoverLetter(true)
    setCoverLetter('')
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cover-letter',
          job,
          userProfile
        })
      })
      
      const data = await response.json()
      setCoverLetter(data.coverLetter || 'Failed to generate cover letter')
    } catch (error) {
      console.error('Cover letter generation failed:', error)
    } finally {
      setGeneratingCoverLetter(false)
    }
  }
  
  // Analyze Resume
  const analyzeResume = async () => {
    if (!resumeText.trim()) return
    
    setAnalyzingResume(true)
    setResumeAnalysis(null)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-resume',
          resumeText
        })
      })
      
      const data = await response.json()
      setResumeAnalysis(data.analysis)
      setUserProfile(resumeText)
      localStorage.setItem('userProfile', resumeText)
    } catch (error) {
      console.error('Resume analysis failed:', error)
    } finally {
      setAnalyzingResume(false)
    }
  }
  
  // Generate Interview Questions
  const generateInterviewQuestions = async (job: Job) => {
    setSelectedInterviewJob(job)
    setGeneratingQuestions(true)
    setInterviewQuestions([])
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interview-questions',
          job
        })
      })
      
      const data = await response.json()
      setInterviewQuestions(data.questions || [])
    } catch (error) {
      console.error('Interview questions generation failed:', error)
    } finally {
      setGeneratingQuestions(false)
    }
  }
  
  // Fetch company intel
  const fetchCompanyIntel = async (companyName: string) => {
    setLoadingCompanyIntel(true)
    setActiveTab('intel')
    try {
      const response = await fetch(\`/api/reviews?company=\${encodeURIComponent(companyName)}\`)
      const data = await response.json()
      
      if (data && data.avg_rating) {
        setCompanyIntel(data)
        setSelectedCompany(companyName)
      } else {
        const mockIntel = generateMockCompanyIntel(companyName)
        setCompanyIntel(mockIntel)
        setSelectedCompany(companyName)
      }
    } catch (error) {
      console.error('Failed to fetch company intel:', error)
      const mockIntel = generateMockCompanyIntel(companyName)
      setCompanyIntel(mockIntel)
      setSelectedCompany(companyName)
    } finally {
      setLoadingCompanyIntel(false)
    }
  }
  
  // Generate mock company intel
  const generateMockCompanyIntel = (companyName: string): CompanyIntel => {
    const baseRating = 3.2 + Math.random() * 1.3
    const reviews = Math.floor(100 + Math.random() * 5000)
    
    return {
      company: companyName,
      avg_rating: Number(baseRating.toFixed(1)),
      total_reviews: reviews,
      avg_salary_min: Math.floor(80000 + Math.random() * 40000),
      avg_salary_max: Math.floor(140000 + Math.random() * 60000),
      avg_work_life_balance: Number((3 + Math.random() * 1.5).toFixed(1)),
      avg_compensation: Number((3.2 + Math.random() * 1.3).toFixed(1)),
      interview_questions_count: Math.floor(20 + Math.random() * 200),
      interview_difficulty: Number((2.5 + Math.random() * 1.5).toFixed(1)),
      recommend_to_friend: Math.floor(60 + Math.random() * 30),
      ceo_approval: Math.floor(50 + Math.random() * 40),
      recent_reviews: [
        {
          job_title: 'Software Engineer',
          rating: Math.floor(3 + Math.random() * 2),
          pros: 'Great work-life balance and collaborative environment.',
          cons: 'Salary could be more competitive.',
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          job_title: 'Product Manager',
          rating: Math.floor(3 + Math.random() * 2),
          pros: 'Excellent leadership and clear product vision.',
          cons: 'Fast-paced environment can be stressful.',
          date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      salaries: [
        { job_title: 'Software Engineer', min: 100000, max: 180000, location: 'San Francisco' },
        { job_title: 'Product Manager', min: 120000, max: 200000, location: 'San Francisco' },
        { job_title: 'Data Scientist', min: 110000, max: 190000, location: 'New York' }
      ],
      interview_questions: [
        { question: 'Tell me about a challenging project you worked on.', difficulty: 'medium', category: 'behavioral' },
        { question: 'How do you handle conflicting priorities?', difficulty: 'easy', category: 'behavioral' },
        { question: 'Explain your approach to system design.', difficulty: 'hard', category: 'technical' }
      ]
    }
  }
  
  // Apply to job
  const applyToJob = async (job: Job) => {
    const application = {
      id: \`app-\${Date.now()}\`,
      job_id: job.id,
      job,
      status: 'applied',
      applied_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    const updated = [...applications, application]
    setApplications(updated)
    localStorage.setItem('applications', JSON.stringify(updated))
  }
  
  // Create Job Alert
  const createJobAlert = () => {
    const alert: JobAlert = {
      id: \`alert-\${Date.now()}\`,
      name: newAlert.name || \`Alert for "\${newAlert.search_query}"\`,
      search_query: newAlert.search_query || '',
      location: newAlert.location,
      job_type: newAlert.job_type,
      min_salary: newAlert.min_salary,
      remote_only: newAlert.remote_only || false,
      frequency: newAlert.frequency || 'daily',
      is_active: true,
      jobs_sent_count: 0
    }
    
    const updated = [...jobAlerts, alert]
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
    setShowAlertDialog(false)
    setNewAlert({ name: '', search_query: '', frequency: 'daily', remote_only: false })
  }
  
  // Toggle Alert
  const toggleAlert = (alertId: string) => {
    const updated = jobAlerts.map(a => 
      a.id === alertId ? { ...a, is_active: !a.is_active } : a
    )
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }
  
  // Delete Alert
  const deleteAlert = (alertId: string) => {
    const updated = jobAlerts.filter(a => a.id !== alertId)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }
  
  // Auth handlers
  const handleAuth = async () => {
    setAuthLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newUser: User = {
        id: \`user-\${Date.now()}\`,
        email: authEmail,
        full_name: authName || authEmail.split('@')[0]
      }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setShowAuthDialog(false)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
    } catch (error) {
      console.error('Auth failed:', error)
    } finally {
      setAuthLoading(false)
    }
  }
  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }
  
  // Match score color
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NextJob</h1>
                <p className="text-xs text-gray-500">AI-Powered Career Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="jobs">Find Jobs</TabsTrigger>
                  <TabsTrigger value="resume">Resume AI</TabsTrigger>
                  <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                  <TabsTrigger value="intel">Company Intel</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hi, {user.full_name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
                  <LogIn className="w-4 h-4 mr-1" /> Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="mt-0">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search jobs, skills, companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && searchJobs()} />
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" />
                </div>
                <Button onClick={searchJobs} disabled={loading} className="gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                  Search Jobs
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">AI-Powered Job Matching</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={showMatchScores} onCheckedChange={setShowMatchScores} />
                    <span className="text-sm text-gray-600">Enable Match Scores</span>
                  </label>
                </div>
                {showMatchScores && (
                  <div className="mt-3">
                    <Textarea placeholder="Paste your resume or describe your skills/experience for AI-powered job matching..." value={userProfile} onChange={(e) => setUserProfile(e.target.value)} className="min-h-[80px]" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Found <span className="font-semibold">{total.toLocaleString()}</span> jobs</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAlertDialog(true)}>
                <Bell className="w-4 h-4 mr-1" /> Create Alert
              </Button>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                        {job.match_score !== undefined && showMatchScores && (
                          <Badge className={getMatchColor(job.match_score)}>{job.match_score}% Match</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => fetchCompanyIntel(job.company)}>{job.company}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {job.is_remote && <Badge variant="secondary" className="bg-green-50 text-green-700">Remote</Badge>}
                        <Badge variant="outline">{job.job_type}</Badge>
                        <Badge variant="outline" className="text-xs">{job.source}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job)}>
                      {savedJobs.some(j => j.id === job.id) ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                          <FileText className="w-4 h-4 mr-1" /> AI Cover Letter
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>AI-Generated Cover Letter</DialogTitle>
                          <DialogDescription>Personalized cover letter for {job.title} at {job.company}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {coverLetter ? (
                            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">{coverLetter}</div>
                          ) : (
                            <div className="text-center py-8">
                              <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                              <p className="text-gray-500 mb-4">{!userProfile ? 'Enter your profile above to generate a personalized cover letter' : 'Generate a tailored cover letter using AI'}</p>
                              <Button onClick={() => generateCoverLetter(job)} disabled={!userProfile || generatingCoverLetter}>
                                {generatingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedInterviewJob(job); setActiveTab('interview'); }}>
                      <HelpCircle className="w-4 h-4 mr-1" /> Prep
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fetchCompanyIntel(job.company)}>
                      <Building2 className="w-4 h-4 mr-1" /> Intel
                    </Button>
                    <Button size="sm" className="ml-auto" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">Apply <ExternalLink className="w-4 h-4 ml-1" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <span className="px-4">Page {page} of {totalPages}</span>
              <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          )}
        </TabsContent>

        {/* Resume AI Tab */}
        <TabsContent value="resume" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Resume Analyzer</CardTitle>
                <CardDescription>Paste your resume for AI-powered analysis and optimization tips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea placeholder="Paste your resume text here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="min-h-[300px] font-mono text-sm" />
                  <div className="flex items-center gap-2">
                    <Button onClick={analyzeResume} disabled={!resumeText.trim() || analyzingResume} className="flex-1">
                      {analyzingResume ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Brain className="w-4 h-4 mr-2" /> Analyze Resume</>}
                    </Button>
                    <Button variant="outline" onClick={() => setResumeText('')}>Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {!resumeAnalysis ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Paste your resume and click "Analyze" to see AI-powered insights</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      <div className={`text-5xl font-bold ${getScoreColor(resumeAnalysis.overall_score)}`}>{resumeAnalysis.overall_score}</div>
                      <p className="text-sm text-gray-600 mt-1">Overall Resume Score</p>
                      <Progress value={resumeAnalysis.overall_score} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">ATS Compatibility</span>
                      <div className="flex items-center gap-2">
                        <Progress value={resumeAnalysis.ats_compatibility_score} className="w-24" />
                        <span className={`font-bold ${getScoreColor(resumeAnalysis.ats_compatibility_score)}`}>{resumeAnalysis.ats_compatibility_score}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Experience Detected</span>
                      <Badge variant="secondary">{resumeAnalysis.experience_years} years</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-600" /> Strengths</h4>
                      <ul className="space-y-1">{resumeAnalysis.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-green-500 mt-1">•</span>{s}</li>)}</ul>
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-600" /> Areas to Improve</h4>
                      <ul className="space-y-1">{resumeAnalysis.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-red-500 mt-1">•</span>{w}</li>)}</ul>
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-blue-600" /> Skills Detected</h4>
                      <div className="flex flex-wrap gap-2">{resumeAnalysis.skills_detected.map((skill, i) => <Badge key={i} variant="outline">{skill}</Badge>)}</div>
                    </div>

                    {resumeAnalysis.keywords_missing.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-yellow-600" /> Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">{resumeAnalysis.keywords_missing.map((keyword, i) => <Badge key={i} variant="secondary" className="bg-yellow-50 text-yellow-700">{keyword}</Badge>)}</div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-purple-600" /> Best Fit Job Titles</h4>
                      <div className="flex flex-wrap gap-2">{resumeAnalysis.job_titles_fit.map((title, i) => <Badge key={i} variant="secondary">{title}</Badge>)}</div>
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="w-4 h-4 text-amber-600" /> Recommendations</h4>
                      <ul className="space-y-1">{resumeAnalysis.improvements.map((imp, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>{imp}</li>)}</ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interview Prep Tab */}
        <TabsContent value="interview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Target Job</CardTitle>
                <CardDescription>Select a saved job or enter details manually</CardDescription>
              </CardHeader>
              <CardContent>
                {savedJobs.length > 0 ? (
                  <div className="space-y-2">{savedJobs.map((job) => (
                    <div key={job.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedInterviewJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`} onClick={() => setSelectedInterviewJob(job)}>
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                  ))}</div>
                ) : (
                  <div className="space-y-4">
                    <Input placeholder="Job Title (e.g., Software Engineer)" value={selectedInterviewJob?.title || ''} onChange={(e) => setSelectedInterviewJob(prev => ({ ...prev, id: 'manual', title: e.target.value, company: prev?.company || 'Company', location: '', description: '', url: '', posted_date: '', tags: [], job_type: 'Full-time', is_remote: false, source: 'Manual' }))} />
                    <Input placeholder="Company Name" value={selectedInterviewJob?.company || ''} onChange={(e) => setSelectedInterviewJob(prev => ({ ...prev, id: 'manual', title: prev?.title || 'Job Title', company: e.target.value, location: '', description: '', url: '', posted_date: '', tags: [], job_type: 'Full-time', is_remote: false, source: 'Manual' } as Job))} />
                  </div>
                )}
                <Button className="w-full mt-4" onClick={() => selectedInterviewJob && generateInterviewQuestions(selectedInterviewJob)} disabled={!selectedInterviewJob || generatingQuestions}>
                  {generatingQuestions ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Questions</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Interview Questions</CardTitle>
                <CardDescription>{interviewQuestions.length > 0 ? `${interviewQuestions.length} questions generated` : 'Select a job and generate questions to start practicing'}</CardDescription>
              </CardHeader>
              <CardContent>
                {interviewQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Generate AI-powered interview questions tailored to your target role</p>
                  </div>
                ) : (
                  <div className="space-y-4">{interviewQuestions.map((q, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{q.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{q.category}</Badge>
                              <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'secondary'} className="text-xs">{q.difficulty}</Badge>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestion === i ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                      {expandedQuestion === i && (
                        <div className="p-4 bg-gray-50 border-t">
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Tips:</p>
                            <p className="text-sm text-gray-600">{q.tips}</p>
                          </div>
                          {q.sample_answer && <div><p className="text-sm font-medium text-gray-700 mb-1">Sample Answer:</p><p className="text-sm text-gray-600 whitespace-pre-wrap">{q.sample_answer}</p></div>}
                        </div>
                      )}
                    </div>
                  ))}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Intel Tab */}
        <TabsContent value="intel" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Intelligence</CardTitle>
                <CardDescription>Search for company reviews, salaries, and interview insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input placeholder="Search company (e.g., Google, Microsoft)" onKeyDown={(e) => { if (e.key === 'Enter') fetchCompanyIntel((e.target as HTMLInputElement).value) }} />
                  <Button onClick={() => {}}>Search</Button>
                </div>
              </CardContent>
            </Card>

            {loadingCompanyIntel && (
              <Card>
                <CardContent className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="mt-4 text-gray-500">Loading company data...</p>
                </CardContent>
              </Card>
            )}

            {companyIntel && !loadingCompanyIntel && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{companyIntel.company}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{companyIntel.avg_rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({companyIntel.total_reviews.toLocaleString()} reviews)</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Avg Salary:</span>
                        <span className="font-semibold ml-1">${companyIntel.avg_salary_min.toLocaleString()} - ${companyIntel.avg_salary_max.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{companyIntel.recommend_to_friend}%</div>
                        <div className="text-xs text-gray-600">Recommend to Friend</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{companyIntel.ceo_approval}%</div>
                        <div className="text-xs text-gray-600">CEO Approval</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Company Ratings</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><div className="flex justify-between text-sm mb-1"><span>Work-Life Balance</span><span>{companyIntel.avg_work_life_balance.toFixed(1)}/5</span></div><Progress value={companyIntel.avg_work_life_balance * 20} /></div>
                    <div><div className="flex justify-between text-sm mb-1"><span>Compensation</span><span>{companyIntel.avg_compensation.toFixed(1)}/5</span></div><Progress value={companyIntel.avg_compensation * 20} /></div>
                    <div><div className="flex justify-between text-sm mb-1"><span>Interview Difficulty</span><span>{companyIntel.interview_difficulty.toFixed(1)}/5</span></div><Progress value={companyIntel.interview_difficulty * 20} /></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">{companyIntel.recent_reviews.map((review, i) => (
                      <div key={i} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{review.job_title}</span>
                          <div className="flex items-center gap-1">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}</div>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-green-600">+ {review.pros}</p>
                          <p className="text-red-600">- {review.cons}</p>
                        </div>
                      </div>
                    ))}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Salary Data</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">{companyIntel.salaries.map((salary, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div><p className="font-medium text-sm">{salary.job_title}</p><p className="text-xs text-gray-500">{salary.location}</p></div>
                        <p className="font-semibold text-green-600">${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}</p>
                      </div>
                    ))}</div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Interview Insights</CardTitle>
                    <CardDescription>{companyIntel.interview_questions_count.toLocaleString()} interview questions shared by candidates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{companyIntel.interview_questions.map((q, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{q.category}</Badge>
                          <Badge variant={q.difficulty === 'hard' ? 'destructive' : 'secondary'} className="text-xs">{q.difficulty}</Badge>
                        </div>
                      </div>
                    ))}</div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Popular Companies</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Stripe', 'Airbnb', 'Uber', 'Salesforce'].map((company) => (
                    <Button key={company} variant="outline" className="justify-start" onClick={() => fetchCompanyIntel(company)}>
                      <Building2 className="w-4 h-4 mr-2" />{company}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Alerts Tab */}
        <TabsContent value="alerts" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Create Job Alert</CardTitle>
                <CardDescription>Get notified when new jobs match your criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><Label>Alert Name</Label><Input placeholder="e.g., Senior React Jobs" value={newAlert.name || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))} /></div>
                  <div><Label>Search Query</Label><Input placeholder="e.g., React, TypeScript, Frontend" value={newAlert.search_query || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))} /></div>
                  <div><Label>Location (Optional)</Label><Input placeholder="e.g., San Francisco, Remote" value={newAlert.location || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))} /></div>
                  <div><Label>Frequency</Label><Select value={newAlert.frequency} onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="instant">Instant</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select></div>
                  <div className="flex items-center justify-between"><Label>Remote Only</Label><Switch checked={newAlert.remote_only} onCheckedChange={(v) => setNewAlert(prev => ({ ...prev, remote_only: v }))} /></div>
                  <Button className="w-full" onClick={createJobAlert} disabled={!newAlert.search_query}><BellRing className="w-4 h-4 mr-2" />Create Alert</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Job Alerts</CardTitle>
                <CardDescription>{jobAlerts.length} alert{jobAlerts.length !== 1 ? 's' : ''} configured</CardDescription>
              </CardHeader>
              <CardContent>
                {jobAlerts.length === 0 ? (
                  <div className="text-center py-12"><Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No job alerts yet. Create one to get notified about new opportunities!</p></div>
                ) : (
                  <div className="space-y-4">{jobAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {alert.is_active ? <BellRing className="w-5 h-5 text-green-600" /> : <Bell className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{alert.name}</p>
                          <p className="text-sm text-gray-500">"{alert.search_query}"{alert.location && ` in ${alert.location}`}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{alert.frequency}</Badge>
                            {alert.remote_only && <Badge variant="secondary" className="text-xs">Remote Only</Badge>}
                            <span className="text-xs text-gray-400">{alert.jobs_sent_count} jobs sent</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleAlert(alert.id)}>{alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}><XCircle className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}</div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Alert Email Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="max-w-xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-bold mb-2">🔔 New Jobs Matching Your Alert</h3>
                      <p className="text-sm text-gray-600 mb-4">Here are the latest jobs matching your "Senior React Jobs" alert:</p>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg"><p className="font-medium">Senior Frontend Engineer</p><p className="text-sm text-gray-600">Google • San Francisco, CA</p><p className="text-sm text-green-600">$180k - $250k</p></div>
                        <div className="p-3 bg-blue-50 rounded-lg"><p className="font-medium">React Developer</p><p className="text-sm text-gray-600">Stripe • Remote</p><p className="text-sm text-green-600">$150k - $200k</p></div>
                      </div>
                      <Button className="w-full mt-4">View All Jobs</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardHeader><CardTitle className="text-lg">Saved Jobs</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{savedJobs.length}</div><p className="text-sm text-gray-500">Jobs bookmarked for later</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-lg">Applications</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{applications.length}</div><p className="text-sm text-gray-500">Total applications sent</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-lg">Interviews</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">{applications.filter(a => a.status === 'interviewing').length}</div><p className="text-sm text-gray-500">Active interview processes</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-lg">Active Alerts</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-amber-600">{jobAlerts.filter(a => a.is_active).length}</div><p className="text-sm text-gray-500">Job alerts monitoring</p></CardContent></Card>
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle>Saved Jobs</CardTitle><CardDescription>Jobs you've bookmarked for later review</CardDescription></CardHeader>
            <CardContent>
              {savedJobs.length === 0 ? (<p className="text-gray-500 text-center py-8">No saved jobs yet. Start browsing and save jobs you're interested in!</p>) : (
                <div className="space-y-4">{savedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div><h4 className="font-medium">{job.title}</h4><p className="text-sm text-gray-600">{job.company} • {job.location}</p></div>
                    <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => applyToJob(job)}>Apply Now</Button><Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job)}>Remove</Button></div>
                  </div>
                ))}</div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader><CardTitle>Application Tracker</CardTitle><CardDescription>Track your job applications and their status</CardDescription></CardHeader>
            <CardContent>
              {applications.length === 0 ? (<p className="text-gray-500 text-center py-8">No applications yet. Apply to jobs to track them here!</p>) : (
                <div className="space-y-4">{applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div><h4 className="font-medium">{app.job.title}</h4><p className="text-sm text-gray-600">{app.job.company}</p><p className="text-xs text-gray-400">Applied: {new Date(app.applied_date).toLocaleDateString()}</p></div>
                    <Badge variant={app.status === 'offer' ? 'default' : app.status === 'interviewing' ? 'secondary' : app.status === 'rejected' ? 'destructive' : 'outline'}>{app.status}</Badge>
                  </div>
                ))}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle><DialogDescription>{authMode === 'login' ? 'Sign in to save your preferences and track applications' : 'Create an account to get started with NextJob'}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {authMode === 'signup' && <div><Label>Full Name</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="John Doe" /></div>}
            <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="john@example.com" /></div>
            <div><Label>Password</Label><Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'Need an account?' : 'Already have an account?'}</Button>
            <Button onClick={handleAuth} disabled={authLoading}>{authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Job Alert</DialogTitle><DialogDescription>Get notified when new jobs match your search criteria</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Alert Name</Label><Input value={newAlert.name} onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Senior React Jobs" /></div>
            <div><Label>Search Query</Label><Input value={newAlert.search_query} onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))} placeholder={search || "e.g., React, TypeScript"} /></div>
            <div><Label>Location</Label><Input value={newAlert.location || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))} placeholder={location || "e.g., San Francisco, Remote"} /></div>
            <div><Label>Frequency</Label><Select value={newAlert.frequency} onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="instant">Instant</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button onClick={createJobAlert} disabled={!newAlert.search_query}>Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>NextJob - AI-Powered Career Platform</p>
          <p className="mt-1">Data from Remotive, Arbeitnow, JSearch, and Adzuna</p>
        </div>
      </footer>
    </div>
  )
}
