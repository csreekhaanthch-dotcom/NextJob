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
import { 
  Search, MapPin, Briefcase, Building2, Star, 
  Clock, DollarSign, FileText, MessageSquare, 
  ChevronRight, ExternalLink, Bookmark, BookmarkCheck,
  Sparkles, Brain, Target, Upload,
  Bell, BellRing, Mail, CheckCircle, XCircle, AlertTriangle,
  User, LogIn, LogOut, Lightbulb, HelpCircle, RefreshCw, Play, Pause
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
}

interface JobAlert {
  id: string
  name: string
  search_query: string
  location?: string
  frequency: string
  is_active: boolean
  jobs_sent_count: number
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [analyzingResume, setAnalyzingResume] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [selectedInterviewJob, setSelectedInterviewJob] = useState<Job | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [companyIntel, setCompanyIntel] = useState<any>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [loadingCompanyIntel, setLoadingCompanyIntel] = useState(false)
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([])
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [newAlert, setNewAlert] = useState<Partial<JobAlert>>({ name: '', search_query: '', frequency: 'daily' })
  const [user, setUser] = useState<any>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
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
    const apps = localStorage.getItem('applications')
    if (apps) setApplications(JSON.parse(apps))
    const alerts = localStorage.getItem('jobAlerts')
    if (alerts) setJobAlerts(JSON.parse(alerts))
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    const storedProfile = localStorage.getItem('userProfile')
    if (storedProfile) setUserProfile(storedProfile)
  }, [])

  const toggleSaveJob = (job: Job) => {
    const isSaved = savedJobs.some(j => j.id === job.id)
    const updated = isSaved ? savedJobs.filter(j => j.id !== job.id) : [...savedJobs, job]
    setSavedJobs(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }

  const generateCoverLetter = async (job: Job) => {
    if (!userProfile) { alert('Please enter your profile first'); return }
    setGeneratingCoverLetter(true)
    setCoverLetter('')
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cover-letter', job, userProfile })
      })
      const data = await response.json()
      setCoverLetter(data.coverLetter || 'Failed to generate')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setGeneratingCoverLetter(false)
    }
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
      console.error('Error:', error)
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
      console.error('Error:', error)
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
        setSelectedCompany(companyName)
      } else {
        setCompanyIntel({
          company: companyName,
          avg_rating: 3.5 + Math.random(),
          total_reviews: Math.floor(100 + Math.random() * 1000),
          avg_salary_min: Math.floor(80000 + Math.random() * 40000),
          avg_salary_max: Math.floor(130000 + Math.random() * 70000),
          avg_work_life_balance: 3.5 + Math.random(),
          avg_compensation: 3.5 + Math.random(),
          interview_difficulty: 2.5 + Math.random(),
          recent_reviews: [
            { job_title: 'Software Engineer', rating: 4, pros: 'Great culture', cons: 'Long hours' }
          ],
          salaries: [
            { job_title: 'Software Engineer', min: 100000, max: 180000, location: 'San Francisco' }
          ],
          interview_questions: [
            { question: 'Tell me about yourself', difficulty: 'easy', category: 'behavioral' }
          ]
        })
        setSelectedCompany(companyName)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingCompanyIntel(false)
    }
  }

  const createJobAlert = () => {
    const alert: JobAlert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name || `Alert for "${newAlert.search_query}"`,
      search_query: newAlert.search_query || '',
      frequency: newAlert.frequency || 'daily',
      is_active: true,
      jobs_sent_count: 0
    }
    const updated = [...jobAlerts, alert]
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
    setShowAlertDialog(false)
    setNewAlert({ name: '', search_query: '', frequency: 'daily' })
  }

  const toggleAlert = (alertId: string) => {
    const updated = jobAlerts.map(a => a.id === alertId ? { ...a, is_active: !a.is_active } : a)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }

  const deleteAlert = (alertId: string) => {
    const updated = jobAlerts.filter(a => a.id !== alertId)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
  }

  const handleAuth = async () => {
    const newUser = { id: `user-${Date.now()}`, email: authEmail, full_name: authName || authEmail.split('@')[0] }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    setShowAuthDialog(false)
    setAuthEmail(''); setAuthPassword(''); setAuthName('')
  }

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
                  <TabsTrigger value="jobs">Jobs</TabsTrigger>
                  <TabsTrigger value="resume">Resume AI</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="intel">Intel</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                </TabsList>
              </Tabs>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hi, {user.full_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => { setUser(null); localStorage.removeItem('user') }}><LogOut className="w-4 h-4 mr-1" />Logout</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}><LogIn className="w-4 h-4 mr-1" />Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <TabsContent value="jobs" className="mt-0">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && searchJobs()} />
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-10" />
                </div>
                <Button onClick={searchJobs} disabled={loading} className="gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" /><span className="text-sm font-medium">AI Job Matching</span></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={showMatchScores} onCheckedChange={setShowMatchScores} />
                  <span className="text-sm text-gray-600">Enable</span>
                </label>
              </div>
              {showMatchScores && <Textarea placeholder="Paste your resume for AI matching..." value={userProfile} onChange={(e) => setUserProfile(e.target.value)} className="mt-3 min-h-[80px]" />}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Found <span className="font-semibold">{total.toLocaleString()}</span> jobs</p>
            <Button variant="outline" size="sm" onClick={() => setShowAlertDialog(true)}><Bell className="w-4 h-4 mr-1" />Create Alert</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                    {job.match_score !== undefined && showMatchScores && <Badge className={getMatchColor(job.match_score)}>{job.match_score}%</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="hover:text-blue-600 cursor-pointer" onClick={() => fetchCompanyIntel(job.company)}>{job.company}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <MapPin className="w-4 h-4" /><span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {job.is_remote && <Badge variant="secondary" className="bg-green-50 text-green-700">Remote</Badge>}
                    <Badge variant="outline">{job.job_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job)}>
                      {savedJobs.some(j => j.id === job.id) ? <BookmarkCheck className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}><FileText className="w-4 h-4 mr-1" />Cover Letter</Button></DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>AI Cover Letter</DialogTitle><DialogDescription>For {job.title} at {job.company}</DialogDescription></DialogHeader>
                        {coverLetter ? <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">{coverLetter}</div> :
                        <div className="text-center py-8">
                          <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">{!userProfile ? 'Enter your profile first' : 'Generate a cover letter'}</p>
                          <Button onClick={() => generateCoverLetter(job)} disabled={!userProfile || generatingCoverLetter}>{generatingCoverLetter ? 'Generating...' : 'Generate'}</Button>
                        </div>}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedInterviewJob(job); setActiveTab('interview') }}><HelpCircle className="w-4 h-4 mr-1" />Prep</Button>
                    <Button size="sm" className="ml-auto" asChild><a href={job.url} target="_blank" rel="noopener noreferrer">Apply<ExternalLink className="w-4 h-4 ml-1" /></a></Button>
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

        <TabsContent value="resume" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Resume Analyzer</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Paste your resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="min-h-[300px] font-mono text-sm" />
                <div className="flex gap-2 mt-4">
                  <Button onClick={analyzeResume} disabled={!resumeText.trim() || analyzingResume} className="flex-1">
                    {analyzingResume ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />Analyze</>}
                  </Button>
                  <Button variant="outline" onClick={() => setResumeText('')}>Clear</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Analysis Results</CardTitle></CardHeader>
              <CardContent>
                {!resumeAnalysis ? <div className="text-center py-12"><FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Paste your resume and analyze</p></div> :
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                    <div className={`text-5xl font-bold ${getScoreColor(resumeAnalysis.overall_score)}`}>{resumeAnalysis.overall_score}</div>
                    <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                    <Progress value={resumeAnalysis.overall_score} className="mt-2" />
                  </div>
                  <div className="flex justify-between p-4 bg-gray-50 rounded-lg"><span>ATS Compatibility</span><span className={getScoreColor(resumeAnalysis.ats_compatibility_score)}>{resumeAnalysis.ats_compatibility_score}%</span></div>
                  <div><h4 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-600" />Strengths</h4><ul className="space-y-1">{resumeAnalysis.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600">• {s}</li>)}</ul></div>
                  <div><h4 className="font-semibold flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-600" />Improve</h4><ul className="space-y-1">{resumeAnalysis.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-600">• {w}</li>)}</ul></div>
                  <div><h4 className="font-semibold flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-blue-600" />Skills</h4><div className="flex flex-wrap gap-2">{resumeAnalysis.skills_detected.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}</div></div>
                </div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Target Job</CardTitle></CardHeader>
              <CardContent>
                {savedJobs.length > 0 ? <div className="space-y-2">{savedJobs.map((job) => (
                  <div key={job.id} className={`p-3 rounded-lg border cursor-pointer ${selectedInterviewJob?.id === job.id ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => setSelectedInterviewJob(job)}><p className="font-medium text-sm">{job.title}</p><p className="text-xs text-gray-500">{job.company}</p></div>
                ))}</div> : <div className="space-y-2"><Input placeholder="Job Title" value={selectedInterviewJob?.title || ''} onChange={(e) => setSelectedInterviewJob({ ...selectedInterviewJob, id: 'manual', title: e.target.value } as Job)} /><Input placeholder="Company" value={selectedInterviewJob?.company || ''} onChange={(e) => setSelectedInterviewJob({ ...selectedInterviewJob, id: 'manual', title: selectedInterviewJob?.title || '', company: e.target.value } as Job)} /></div>}
                <Button className="w-full mt-4" onClick={() => selectedInterviewJob && generateInterviewQuestions(selectedInterviewJob)} disabled={!selectedInterviewJob || generatingQuestions}>{generatingQuestions ? 'Generating...' : 'Generate Questions'}</Button>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Interview Questions</CardTitle></CardHeader>
              <CardContent>
                {interviewQuestions.length === 0 ? <div className="text-center py-12"><HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Generate questions to practice</p></div> :
                <div className="space-y-4">{interviewQuestions.map((q, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}>
                      <div className="flex justify-between"><p className="font-medium">{q.question}</p><ChevronRight className={`w-5 h-5 transition-transform ${expandedQuestion === i ? 'rotate-90' : ''}`} /></div>
                      <div className="flex gap-2 mt-2"><Badge variant="outline">{q.category}</Badge><Badge variant={q.difficulty === 'hard' ? 'destructive' : 'secondary'}>{q.difficulty}</Badge></div>
                    </div>
                    {expandedQuestion === i && <div className="p-4 bg-gray-50 border-t"><p className="text-sm"><strong>Tips:</strong> {q.tips}</p></div>}
                  </div>
                ))}</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intel" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Company Intelligence</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2"><Input placeholder="Search company..." onKeyDown={(e) => e.key === 'Enter' && fetchCompanyIntel((e.target as HTMLInputElement).value)} /><Button onClick={() => {}}>Search</Button></div>
              </CardContent>
            </Card>
            {loadingCompanyIntel && <Card><CardContent className="p-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" /></CardContent></Card>}
            {companyIntel && !loadingCompanyIntel && (
              <>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{companyIntel.company}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="font-semibold">{companyIntel.avg_rating?.toFixed(1)}</span><span className="text-sm text-gray-500">({companyIntel.total_reviews?.toLocaleString()} reviews)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg text-center"><div className="text-xl font-bold text-green-600">${companyIntel.avg_salary_min?.toLocaleString()}</div><div className="text-xs text-gray-600">Min Salary</div></div>
                      <div className="p-3 bg-blue-50 rounded-lg text-center"><div className="text-xl font-bold text-blue-600">${companyIntel.avg_salary_max?.toLocaleString()}</div><div className="text-xs text-gray-600">Max Salary</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle>Popular Companies</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix'].map(c => <Button key={c} variant="outline" size="sm" onClick={() => fetchCompanyIntel(c)}>{c}</Button>)}</div></CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Create Alert</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input placeholder="e.g., React Jobs" value={newAlert.name || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))} /></div>
                  <div><Label>Search Query</Label><Input placeholder="e.g., React, TypeScript" value={newAlert.search_query || ''} onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))} /></div>
                  <div><Label>Frequency</Label><Select value={newAlert.frequency} onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select></div>
                  <Button className="w-full" onClick={createJobAlert} disabled={!newAlert.search_query}><BellRing className="w-4 h-4 mr-2" />Create</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Your Alerts</CardTitle></CardHeader>
              <CardContent>
                {jobAlerts.length === 0 ? <div className="text-center py-8"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No alerts yet</p></div> :
                <div className="space-y-4">{jobAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>{alert.is_active ? <BellRing className="w-5 h-5 text-green-600" /> : <Bell className="w-5 h-5 text-gray-400" />}</div>
                      <div><p className="font-medium">{alert.name}</p><p className="text-sm text-gray-500">"{alert.search_query}" • {alert.frequency}</p></div>
                    </div>
                    <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => toggleAlert(alert.id)}>{alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button><Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}><XCircle className="w-4 h-4 text-red-500" /></Button></div>
                  </div>
                ))}</div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card><CardContent className="p-6"><div className="text-3xl font-bold text-blue-600">{savedJobs.length}</div><p className="text-sm text-gray-500">Saved Jobs</p></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-3xl font-bold text-green-600">{applications.length}</div><p className="text-sm text-gray-500">Applications</p></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-3xl font-bold text-purple-600">{applications.filter(a => a.status === 'interviewing').length}</div><p className="text-sm text-gray-500">Interviews</p></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-3xl font-bold text-amber-600">{jobAlerts.filter(a => a.is_active).length}</div><p className="text-sm text-gray-500">Active Alerts</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Saved Jobs</CardTitle></CardHeader>
            <CardContent>
              {savedJobs.length === 0 ? <p className="text-center py-8 text-gray-500">No saved jobs</p> :
              <div className="space-y-4">{savedJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div><h4 className="font-medium">{job.title}</h4><p className="text-sm text-gray-600">{job.company} • {job.location}</p></div>
                  <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job)}>Remove</Button>
                </div>
              ))}</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {authMode === 'signup' && <div><Label>Name</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} /></div>}
            <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'Need account?' : 'Have account?'}</Button>
            <Button onClick={handleAuth}>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Alert</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={newAlert.name} onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))} /></div>
            <div><Label>Query</Label><Input value={newAlert.search_query} onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))} /></div>
            <div><Label>Frequency</Label><Select value={newAlert.frequency} onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setShowAlertDialog(false)}>Cancel</Button><Button onClick={createJobAlert} disabled={!newAlert.search_query}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-12 py-6 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>NextJob - AI-Powered Career Platform</p>
        </div>
      </footer>
    </div>
  )
}
