'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
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
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Search, MapPin, Briefcase, Building2, Star, TrendingUp, 
  Clock, Users, DollarSign, FileText, MessageSquare, 
  ChevronRight, ExternalLink, Bookmark, BookmarkCheck,
  Sparkles, Brain, Target, Award, Zap, Download,
  Bell, BellRing, Mail, CheckCircle, XCircle, AlertTriangle,
  User, LogIn, LogOut, Settings, FileCheck, FileX,
  Lightbulb, HelpCircle, Send, RefreshCw, Play, Pause,
  Sun, Moon, Menu, Filter, X, Globe, LucideIcon
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
  company_logo?: string
  platform?: string
  verified?: boolean
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
  soft_skills?: string[]
  skills_by_category?: Record<string, string[]>
  experience_years: number
  experience_level?: string
  job_titles_fit: string[]
  keywords_missing: string[]
  ats_compatibility_score: number
  contact_info?: {
    email?: string | null
    phone?: string | null
    linkedin?: string | null
    github?: string | null
  }
  sections_found?: string[]
  action_verbs_used?: string[]
  has_quantifiable_results?: boolean
  certifications?: string[]
  education?: Array<{
    degree: string
    field: string
    institution: string
    year: string | null
  }>
  word_count?: number
  summary_feedback?: string
  formatting_tips?: string[]
  content_suggestions?: string[]
  ai_powered?: boolean
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
  avatar_url?: string
}

// Advanced Filters State
interface AdvancedFilters {
  jobType: string
  experienceLevel: string
  salaryMin: number
  salaryMax: number
  remoteOnly: boolean
  postedWithin: string
  platformFilter: string
  careerPages: boolean
}

// Company Logo Component
function CompanyLogo({ company, size = 'md' }: { company: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }
  
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-red-500 to-red-600',
  ]
  
  const colorIndex = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const initials = company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || company[0].toUpperCase()
  
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold shadow-sm`}>
      {initials}
    </div>
  )
}

// Job Card Skeleton
function JobCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Theme Toggle Component
function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Use a microtask to avoid synchronous setState warning
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])
  
  if (!mounted) return null
  
  const isDark = resolvedTheme === 'dark'
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Mobile Nav Component
function MobileNav({ 
  activeTab, 
  setActiveTab, 
  user, 
  onAuthClick, 
  onLogout 
}: { 
  activeTab: string
  setActiveTab: (tab: string) => void
  user: User | null
  onAuthClick: () => void
  onLogout: () => void
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            NextJob
          </SheetTitle>
          <SheetDescription>
            AI-Powered Career Platform
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {[
            { value: 'jobs', label: 'Find Jobs', icon: Search },
            { value: 'resume', label: 'Resume AI', icon: FileText },
            { value: 'interview', label: 'Interview Prep', icon: MessageSquare },
            { value: 'intel', label: 'Company Intel', icon: Building2 },
            { value: 'alerts', label: 'Alerts', icon: Bell },
            { value: 'dashboard', label: 'Dashboard', icon: Target },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab(tab.value)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.full_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate">{user.full_name || user.email}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={onAuthClick}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function NextJobPlatform() {
  const { theme } = useTheme()
  
  // State
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState('jobs')
  const [showFilters, setShowFilters] = useState(false)
  
  // Advanced Filters
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    jobType: 'all',
    experienceLevel: 'all',
    salaryMin: 0,
    salaryMax: 300000,
    remoteOnly: false,
    postedWithin: 'all',
    platformFilter: 'all',
    careerPages: false
  })
  
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
      // Use POST when profile is large to avoid URL length limits
      const usePost = userProfile && showMatchScores && userProfile.length > 500
      
      const bodyData: Record<string, any> = {
        page,
        limit: 12,
        search,
        location,
        job_type: advancedFilters.jobType !== 'all' ? advancedFilters.jobType : undefined,
        remote: advancedFilters.remoteOnly ? 'true' : undefined,
        careerPages: advancedFilters.careerPages ? 'true' : undefined,
        platform: advancedFilters.platformFilter !== 'all' ? advancedFilters.platformFilter : undefined,
      }
      
      if (userProfile && showMatchScores) {
        bodyData.profile = userProfile
      }
      
      // Remove undefined values
      Object.keys(bodyData).forEach(key => {
        if (bodyData[key] === undefined || bodyData[key] === '') {
          delete bodyData[key]
        }
      })
      
      let response: Response
      
      if (usePost) {
        // Use POST for large profiles
        response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        })
      } else {
        // Use GET for normal searches
        const params = new URLSearchParams()
        Object.entries(bodyData).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
        response = await fetch(`/api/jobs?${params.toString()}`)
      }
      
      const data = await response.json()
      
      let fetchedJobs = data.jobs || []
      
      // Apply client-side filters
      if (advancedFilters.remoteOnly) {
        fetchedJobs = fetchedJobs.filter((job: Job) => job.is_remote)
      }
      
      if (advancedFilters.jobType && advancedFilters.jobType !== 'all') {
        fetchedJobs = fetchedJobs.filter((job: Job) => 
          job.job_type.toLowerCase().includes(advancedFilters.jobType.toLowerCase())
        )
      }
      
      // Salary filter (if salary data available)
      if (advancedFilters.salaryMin > 0) {
        fetchedJobs = fetchedJobs.filter((job: Job) => {
          if (!job.salary) return true
          const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, ''))
          return salaryNum >= advancedFilters.salaryMin
        })
      }
      
      setJobs(fetchedJobs)
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
      
      toast.success(`Found ${fetchedJobs.length} jobs`, {
        description: search ? `Results for "${search}"` : 'Latest job listings'
      })
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed', {
        description: 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }, [search, location, page, userProfile, showMatchScores, advancedFilters])
  
  // Initial load and page change
  useEffect(() => {
    searchJobs()
  }, [page])
  
  // Initial mount - load jobs on first render
  useEffect(() => {
    searchJobs()
  }, [])
  
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
      toast.success('Job removed from saved', {
        description: job.title
      })
    } else {
      updated = [...savedJobs, job]
      toast.success('Job saved!', {
        description: job.title
      })
    }
    
    setSavedJobs(updated)
    localStorage.setItem('savedJobs', JSON.stringify(updated))
  }
  
  // Generate cover letter
  const generateCoverLetter = async (job: Job) => {
    if (!userProfile) {
      toast.warning('Profile required', {
        description: 'Please enter your profile/resume first to generate a cover letter'
      })
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
      toast.success('Cover letter generated!', {
        description: 'You can copy and customize it'
      })
    } catch (error) {
      console.error('Cover letter generation failed:', error)
      toast.error('Generation failed', {
        description: 'Please try again'
      })
    } finally {
      setGeneratingCoverLetter(false)
    }
  }
  
  
  

  
  
  
  // Analyze Resume (for both PDF-extracted text and pasted text)
  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.warning('Resume required', {
        description: 'Please paste your resume text'
      })
      return
    }
    
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
      
      // Update user profile with resume
      setUserProfile(resumeText)
      localStorage.setItem('userProfile', resumeText)
      
      toast.success('Resume analyzed!', {
        description: `Score: ${data.analysis.overall_score}/100`
      })
    } catch (error) {
      console.error('Resume analysis failed:', error)
      toast.error('Analysis failed', {
        description: 'Please try again'
      })
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
      toast.success('Questions generated!', {
        description: `${data.questions?.length || 0} interview questions ready`
      })
    } catch (error) {
      console.error('Interview questions generation failed:', error)
      toast.error('Generation failed')
    } finally {
      setGeneratingQuestions(false)
    }
  }
  
  // Fetch company intel
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
          pros: 'Great work-life balance and collaborative environment. Modern tech stack.',
          cons: 'Salary could be more competitive. Limited growth opportunities.',
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          job_title: 'Product Manager',
          rating: Math.floor(3 + Math.random() * 2),
          pros: 'Excellent leadership and clear product vision. Good compensation.',
          cons: 'Fast-paced environment can be stressful. Long hours during launches.',
          date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          job_title: 'Data Analyst',
          rating: Math.floor(3 + Math.random() * 2),
          pros: 'Interesting problems to solve. Good learning opportunities.',
          cons: 'Resource constraints. Bureaucratic processes.',
          date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      salaries: [
        { job_title: 'Software Engineer', min: 100000, max: 180000, location: 'San Francisco' },
        { job_title: 'Product Manager', min: 120000, max: 200000, location: 'San Francisco' },
        { job_title: 'Data Scientist', min: 110000, max: 190000, location: 'New York' },
        { job_title: 'UX Designer', min: 90000, max: 150000, location: 'Remote' }
      ],
      interview_questions: [
        { question: 'Tell me about a challenging project you worked on.', difficulty: 'medium', category: 'behavioral' },
        { question: 'How do you handle conflicting priorities?', difficulty: 'easy', category: 'behavioral' },
        { question: 'Explain your approach to system design.', difficulty: 'hard', category: 'technical' },
        { question: 'Describe a time you had to influence without authority.', difficulty: 'medium', category: 'behavioral' }
      ]
    }
  }
  
  // Apply to job
  const applyToJob = async (job: Job) => {
    const application = {
      id: `app-${Date.now()}`,
      job_id: job.id,
      job,
      status: 'applied',
      applied_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    const updated = [...applications, application]
    setApplications(updated)
    localStorage.setItem('applications', JSON.stringify(updated))
    
    toast.success('Application tracked!', {
      description: `${job.title} at ${job.company}`
    })
  }
  
  // Create Job Alert
  const createJobAlert = () => {
    if (!newAlert.search_query) {
      toast.warning('Search query required')
      return
    }
    
    const alert: JobAlert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name || `Alert for "${newAlert.search_query}"`,
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
    setNewAlert({
      name: '',
      search_query: '',
      frequency: 'daily',
      remote_only: false
    })
    
    toast.success('Job alert created!', {
      description: `We'll notify you about new "${alert.search_query}" jobs`
    })
  }
  
  // Toggle Alert
  const toggleAlert = (alertId: string) => {
    const updated = jobAlerts.map(a => 
      a.id === alertId ? { ...a, is_active: !a.is_active } : a
    )
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
    
    const alert = jobAlerts.find(a => a.id === alertId)
    toast.success(alert?.is_active ? 'Alert paused' : 'Alert activated')
  }
  
  // Delete Alert
  const deleteAlert = (alertId: string) => {
    const updated = jobAlerts.filter(a => a.id !== alertId)
    setJobAlerts(updated)
    localStorage.setItem('jobAlerts', JSON.stringify(updated))
    toast.success('Alert deleted')
  }
  
  // Auth handlers
  const handleAuth = async () => {
    if (!authEmail) {
      toast.warning('Email required')
      return
    }
    
    setAuthLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: authEmail,
        full_name: authName || authEmail.split('@')[0]
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setShowAuthDialog(false)
      setAuthEmail('')
      setAuthPassword('')
      setAuthName('')
      
      toast.success('Welcome to NextJob!', {
        description: `Signed in as ${newUser.full_name}`
      })
    } catch (error) {
      console.error('Auth failed:', error)
      toast.error('Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }
  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }
  
  // Match score color
  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
  }
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }
  
  // Clear filters
  const clearFilters = () => {
    setAdvancedFilters({
      jobType: 'all',
      experienceLevel: 'all',
      salaryMin: 0,
      salaryMax: 300000,
      remoteOnly: false,
      postedWithin: 'all',
      platformFilter: 'all',
      careerPages: false
    })
    setSearch('')
    setLocation('')
    toast.success('Filters cleared')
  }
  
  const hasActiveFilters = search || location || (advancedFilters.jobType && advancedFilters.jobType !== 'all') || advancedFilters.remoteOnly || advancedFilters.salaryMin > 0 || (advancedFilters.platformFilter && advancedFilters.platformFilter !== 'all') || advancedFilters.careerPages

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Nav */}
            <MobileNav 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onAuthClick={() => setShowAuthDialog(true)}
              onLogout={handleLogout}
            />
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">NextJob</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Career Platform</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent">
                  <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Find Jobs</TabsTrigger>
                  <TabsTrigger value="resume" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Resume AI</TabsTrigger>
                  <TabsTrigger value="interview" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Interview</TabsTrigger>
                  <TabsTrigger value="intel" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Intel</TabsTrigger>
                  <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Alerts</TabsTrigger>
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">Dashboard</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{user.full_name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)} className="hidden sm:flex">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Jobs Tab */}
        <TabsContent value="jobs" className="mt-0 space-y-0">
          {/* Search Section */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {/* Main Search Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-1 lg:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search jobs, skills, companies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-11"
                      onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-11"
                      onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                    />
                  </div>
                  <Button onClick={searchJobs} disabled={loading} className="h-11 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Search Jobs</span>
                  </Button>
                </div>
                
                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        !
                      </Badge>
                    )}
                  </Button>
                  
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                      <X className="w-4 h-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
                
                {/* Advanced Filters Panel */}
                {showFilters && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Job Type</Label>
                        <Select 
                          value={advancedFilters.jobType} 
                          onValueChange={(v) => setAdvancedFilters(prev => ({ ...prev, jobType: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any type</SelectItem>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Experience Level</Label>
                        <Select 
                          value={advancedFilters.experienceLevel}
                          onValueChange={(v) => setAdvancedFilters(prev => ({ ...prev, experienceLevel: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Any level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any level</SelectItem>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior Level</SelectItem>
                            <SelectItem value="lead">Lead / Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Posted Within</Label>
                        <Select 
                          value={advancedFilters.postedWithin}
                          onValueChange={(v) => setAdvancedFilters(prev => ({ ...prev, postedWithin: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any time</SelectItem>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border bg-white dark:bg-gray-900">
                          <Switch
                            checked={advancedFilters.remoteOnly}
                            onCheckedChange={(v) => setAdvancedFilters(prev => ({ ...prev, remoteOnly: v }))}
                          />
                          <span className="text-sm font-medium">Remote Only</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Salary Range */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs text-gray-500">Salary Range</Label>
                        <span className="text-sm font-medium">
                          ${advancedFilters.salaryMin.toLocaleString()} - ${advancedFilters.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <Slider
                        value={[advancedFilters.salaryMin, advancedFilters.salaryMax]}
                        onValueChange={([min, max]: number[]) => setAdvancedFilters(prev => ({ ...prev, salaryMin: min, salaryMax: max }))}
                        max={300000}
                        step={10000}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Career Pages & Platform Filter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div className="flex-1">
                          <Label className="text-sm font-medium">Include Career Pages</Label>
                          <p className="text-xs text-gray-500">Fetch from 60+ company career pages</p>
                        </div>
                        <Switch
                          checked={advancedFilters.careerPages}
                          onCheckedChange={(v) => setAdvancedFilters(prev => ({ ...prev, careerPages: v }))}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Platform Filter</Label>
                        <Select 
                          value={advancedFilters.platformFilter}
                          onValueChange={(v) => setAdvancedFilters(prev => ({ ...prev, platformFilter: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All Platforms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                            <SelectItem value="Lever">Lever</SelectItem>
                            <SelectItem value="SmartRecruiters">SmartRecruiters</SelectItem>
                            <SelectItem value="Ashby">Ashby</SelectItem>
                            <SelectItem value="Remotive">Remotive</SelectItem>
                            <SelectItem value="Arbeitnow">Arbeitnow</SelectItem>
                            <SelectItem value="RemoteOK">RemoteOK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* AI Matching Toggle */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">AI-Powered Job Matching</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch
                        checked={showMatchScores}
                        onCheckedChange={setShowMatchScores}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Enable Match Scores</span>
                    </label>
                  </div>
                  
                  {showMatchScores && (
                    <div className="mt-3 animate-in slide-in-from-top-2">
                      <Textarea
                        placeholder="Paste your resume or describe your skills/experience for AI-powered job matching..."
                        value={userProfile}
                        onChange={(e) => setUserProfile(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Stats */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString()}</span> jobs
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAlertDialog(true)} className="gap-1">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Create Alert</span>
              </Button>
              <Select defaultValue="relevance" onValueChange={() => {}}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search criteria</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-all hover:scale-[1.01] overflow-hidden group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <CompanyLogo company={job.company} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{job.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span 
                                className="hover:text-blue-600 cursor-pointer truncate"
                                onClick={() => fetchCompanyIntel(job.company)}
                              >
                                {job.company}
                              </span>
                              <Separator orientation="vertical" className="h-4 hidden sm:block" />
                              <MapPin className="w-4 h-4 flex-shrink-0 hidden sm:block" />
                              <span className="truncate hidden sm:block">{job.location}</span>
                            </div>
                          </div>
                          {job.match_score !== undefined && showMatchScores && (
                            <Badge className={`${getMatchColor(job.match_score)} flex-shrink-0`}>
                              {job.match_score}% Match
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {job.is_remote && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Remote
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{job.job_type}</Badge>
                          {job.source && (
                            <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                              <Globe className="w-3 h-3 mr-1" />
                              {job.source}
                            </Badge>
                          )}
                          {job.platform && (
                            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {job.platform}
                            </Badge>
                          )}
                          {job.verified && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                          {job.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {job.salary && (
                            <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleSaveJob(job)}
                        title={savedJobs.some(j => j.id === job.id) ? 'Remove from saved' : 'Save job'}
                      >
                        {savedJobs.some(j => j.id === job.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Cover Letter</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>AI-Generated Cover Letter</DialogTitle>
                            <DialogDescription>
                              Personalized cover letter for {job.title} at {job.company}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {coverLetter ? (
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
                                {coverLetter}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                  {!userProfile 
                                    ? 'Enter your profile above to generate a personalized cover letter'
                                    : 'Generate a tailored cover letter using AI'}
                                </p>
                                <Button 
                                  onClick={() => generateCoverLetter(job)}
                                  disabled={!userProfile || generatingCoverLetter}
                                >
                                  {generatingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedInterviewJob(job)
                          setActiveTab('interview')
                          toast.success('Switched to Interview Prep', {
                            description: `Ready to prepare for ${job.title}`
                          })
                        }}
                      >
                        <HelpCircle className="w-4 h-4 mr-1 hidden sm:inline" />
                        Prep
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchCompanyIntel(job.company)}
                        className="hidden sm:flex"
                      >
                        <Building2 className="w-4 h-4 mr-1" />
                        Intel
                      </Button>
                      <Button size="sm" className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          Apply <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Resume AI Tab */}

        {/* Resume AI Tab */}
        <TabsContent value="resume" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Analyzer
                </CardTitle>
                <CardDescription>
                  Paste your resume for AI-powered analysis and ATS scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Text Paste Area */}
                  <Textarea
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[350px] font-mono text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={analyzeResume} 
                      disabled={!resumeText.trim() || analyzingResume}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {analyzingResume ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze Resume
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        setResumeText(''); 
                        setResumeAnalysis(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="w-3 h-3" />
                    <span>AI-powered analysis with ATS scoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Analysis Results
                  {resumeAnalysis?.ai_powered && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                      <Sparkles className="w-3 h-3 mr-1" /> AI Enhanced
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!resumeAnalysis ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Paste your resume and click "Analyze" to see AI-powered insights
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
                      <div className={`text-5xl font-bold ${getScoreColor(resumeAnalysis.overall_score)}`}>
                        {resumeAnalysis.overall_score}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Resume Score</p>
                      <Progress value={resumeAnalysis.overall_score} className="mt-2" />
                      {resumeAnalysis.summary_feedback && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
                          "{resumeAnalysis.summary_feedback}"
                        </p>
                      )}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* ATS Score */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">ATS Score</p>
                        <p className={`text-lg font-bold ${getScoreColor(resumeAnalysis.ats_compatibility_score)}`}>
                          {resumeAnalysis.ats_compatibility_score}%
                        </p>
                      </div>
                      
                      {/* Experience */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {resumeAnalysis.experience_years} yrs
                        </p>
                      </div>
                      
                      {/* Experience Level */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Level</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">
                          {resumeAnalysis.experience_level || 'Mid'}
                        </p>
                      </div>
                      
                      {/* Skills Count */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Skills</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {resumeAnalysis.skills_detected.length}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info Extracted */}
                    {resumeAnalysis.contact_info && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Contact Info Extracted
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {resumeAnalysis.contact_info.email && (
                            <div className="truncate"><span className="text-gray-500">Email:</span> {resumeAnalysis.contact_info.email}</div>
                          )}
                          {resumeAnalysis.contact_info.phone && (
                            <div className="truncate"><span className="text-gray-500">Phone:</span> {resumeAnalysis.contact_info.phone}</div>
                          )}
                          {resumeAnalysis.contact_info.linkedin && (
                            <div className="truncate col-span-2"><span className="text-gray-500">LinkedIn:</span> {resumeAnalysis.contact_info.linkedin}</div>
                          )}
                          {resumeAnalysis.contact_info.github && (
                            <div className="truncate col-span-2"><span className="text-gray-500">GitHub:</span> {resumeAnalysis.contact_info.github}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sections Found */}
                    {resumeAnalysis.sections_found && resumeAnalysis.sections_found.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          Sections Detected
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.sections_found.map((section, i) => (
                            <Badge key={i} variant="outline" className="bg-white dark:bg-gray-800">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {resumeAnalysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-1">
                        {resumeAnalysis.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technical Skills by Category */}
                    {resumeAnalysis.skills_by_category && Object.keys(resumeAnalysis.skills_by_category).length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-blue-600" />
                          Technical Skills by Category
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(resumeAnalysis.skills_by_category).map(([category, skills]: [string, string[]]) => (
                            <div key={category} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 capitalize">
                                {category.replace('_', ' ')} ({skills.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft Skills */}
                    {resumeAnalysis.soft_skills && resumeAnalysis.soft_skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          Soft Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.soft_skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeAnalysis.education && resumeAnalysis.education.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-indigo-600" />
                          Education
                        </h4>
                        <div className="space-y-2">
                          {resumeAnalysis.education.map((edu, i) => (
                            <div key={i} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                              <p className="font-medium text-sm">{edu.degree} in {edu.field}</p>
                              <p className="text-xs text-gray-500">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeAnalysis.certifications && resumeAnalysis.certifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-amber-600" />
                          Certifications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.certifications.map((cert, i) => (
                            <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Verbs */}
                    {resumeAnalysis.action_verbs_used && resumeAnalysis.action_verbs_used.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-cyan-600" />
                          Action Verbs Used ({resumeAnalysis.action_verbs_used.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeAnalysis.action_verbs_used.slice(0, 10).map((verb, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded">
                              {verb}
                            </span>
                          ))}
                          {resumeAnalysis.action_verbs_used.length > 10 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                              +{resumeAnalysis.action_verbs_used.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quantifiable Results Check */}
                    <div className={`p-3 rounded-lg ${resumeAnalysis.has_quantifiable_results ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                      <div className="flex items-center gap-2">
                        {resumeAnalysis.has_quantifiable_results ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                              Contains quantifiable achievements
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                              Add quantifiable achievements (e.g., "Increased sales by 25%")
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    {resumeAnalysis.keywords_missing.length > 0 && (
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resumeAnalysis.keywords_missing.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Titles Fit */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        Best Fit Job Titles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeAnalysis.job_titles_fit.map((title, i) => (
                          <Badge key={i} variant="secondary">{title}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {resumeAnalysis.improvements.map((imp, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Word Count */}
                    {resumeAnalysis.word_count && (
                      <div className="text-xs text-gray-400 text-center pt-2 border-t">
                        Resume length: {resumeAnalysis.word_count} words
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interview Prep Tab */}
        <TabsContent value="interview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Target Job
                </CardTitle>
                <CardDescription>
                  Select a saved job or enter details manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedJobs.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {savedJobs.map((job) => (
                      <div 
                        key={job.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedInterviewJob?.id === job.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                            : 'hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedInterviewJob(job)}
                      >
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.company}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Job Title (e.g., Software Engineer)"
                      value={selectedInterviewJob?.title || ''}
                      onChange={(e) => setSelectedInterviewJob(prev => ({
                        ...prev,
                        id: 'manual',
                        title: e.target.value,
                        company: prev?.company || 'Company',
                        location: '',
                        description: '',
                        url: '',
                        posted_date: '',
                        tags: [],
                        job_type: 'Full-time',
                        is_remote: false,
                        source: 'Manual'
                      }))}
                    />
                    <Input
                      placeholder="Company Name"
                      value={selectedInterviewJob?.company || ''}
                      onChange={(e) => setSelectedInterviewJob(prev => ({
                        ...prev,
                        id: 'manual',
                        title: prev?.title || 'Job Title',
                        company: e.target.value,
                        location: '',
                        description: '',
                        url: '',
                        posted_date: '',
                        tags: [],
                        job_type: 'Full-time',
                        is_remote: false,
                        source: 'Manual'
                      } as Job))}
                    />
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4"
                  onClick={() => selectedInterviewJob && generateInterviewQuestions(selectedInterviewJob)}
                  disabled={!selectedInterviewJob || generatingQuestions}
                >
                  {generatingQuestions ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Interview Questions
                </CardTitle>
                <CardDescription>
                  {interviewQuestions.length > 0 
                    ? `${interviewQuestions.length} questions generated for ${selectedInterviewJob?.title}`
                    : 'Select a job and generate questions to start practicing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatingQuestions ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : interviewQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Generate AI-powered interview questions tailored to your target role
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewQuestions.map((q, i) => (
                      <div 
                        key={i}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{q.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">{q.category}</Badge>
                                <Badge 
                                  variant={
                                    q.difficulty === 'hard' ? 'destructive' :
                                    q.difficulty === 'medium' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {q.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedQuestion === i ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>
                        
                        {expandedQuestion === i && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tips:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{q.tips}</p>
                            </div>
                            {q.sample_answer && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Answer:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{q.sample_answer}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Intel Tab */}
        <TabsContent value="intel" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Company */}
            <Card>
              <CardHeader>
                <CardTitle>Company Intelligence</CardTitle>
                <CardDescription>Search for company reviews, salaries, and interview insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search company (e.g., Google, Microsoft)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchCompanyIntel((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                  <Button onClick={() => {}}>Search</Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loadingCompanyIntel && (
              <Card>
                <CardContent className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="mt-4 text-gray-500">Loading company data...</p>
                </CardContent>
              </Card>
            )}

            {/* Company Stats */}
            {companyIntel && !loadingCompanyIntel && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {companyIntel.company}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{companyIntel.avg_rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({companyIntel.total_reviews.toLocaleString()} reviews)</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Avg Salary:</span>
                        <span className="font-semibold ml-1">
                          ${companyIntel.avg_salary_min.toLocaleString()} - ${companyIntel.avg_salary_max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{companyIntel.recommend_to_friend}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Recommend to Friend</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{companyIntel.ceo_approval}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">CEO Approval</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ratings Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Ratings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Work-Life Balance</span>
                        <span>{companyIntel.avg_work_life_balance.toFixed(1)}/5</span>
                      </div>
                      <Progress value={companyIntel.avg_work_life_balance * 20} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Compensation</span>
                        <span>{companyIntel.avg_compensation.toFixed(1)}/5</span>
                      </div>
                      <Progress value={companyIntel.avg_compensation * 20} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Interview Difficulty</span>
                        <span>{companyIntel.interview_difficulty.toFixed(1)}/5</span>
                      </div>
                      <Progress value={companyIntel.interview_difficulty * 20} />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companyIntel.recent_reviews.map((review, i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{review.job_title}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star 
                                  key={j}
                                  className={`w-3 h-3 ${j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-green-600 dark:text-green-400">+ {review.pros}</p>
                            <p className="text-red-600 dark:text-red-400">- {review.cons}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companyIntel.salaries.map((salary, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{salary.job_title}</p>
                            <p className="text-xs text-gray-500">{salary.location}</p>
                          </div>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Interview Questions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Interview Insights
                    </CardTitle>
                    <CardDescription>
                      {companyIntel.interview_questions_count.toLocaleString()} interview questions shared by candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyIntel.interview_questions.map((q, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <p className="font-medium text-sm mb-2">{q.question}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{q.category}</Badge>
                            <Badge 
                              variant={q.difficulty === 'hard' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {q.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Popular Companies */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Popular Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Stripe', 'Airbnb', 'Uber', 'Salesforce'].map((company) => (
                    <Button 
                      key={company}
                      variant="outline" 
                      className="justify-start"
                      onClick={() => fetchCompanyIntel(company)}
                    >
                      <CompanyLogo company={company} size="sm" />
                      <span className="ml-2 truncate">{company}</span>
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
            {/* Create Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Create Job Alert
                </CardTitle>
                <CardDescription>
                  Get notified when new jobs match your criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Alert Name</Label>
                    <Input 
                      placeholder="e.g., Senior React Jobs"
                      value={newAlert.name || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Search Query</Label>
                    <Input 
                      placeholder="e.g., React, TypeScript, Frontend"
                      value={newAlert.search_query || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Location (Optional)</Label>
                    <Input 
                      placeholder="e.g., San Francisco, Remote"
                      value={newAlert.location || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={newAlert.frequency} 
                      onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Remote Only</Label>
                    <Switch 
                      checked={newAlert.remote_only}
                      onCheckedChange={(v) => setNewAlert(prev => ({ ...prev, remote_only: v }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={createJobAlert}
                    disabled={!newAlert.search_query}
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Job Alerts</CardTitle>
                <CardDescription>
                  {jobAlerts.length} alert{jobAlerts.length !== 1 ? 's' : ''} configured
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No job alerts yet. Create one to get notified about new opportunities!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            alert.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {alert.is_active ? (
                              <BellRing className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Bell className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{alert.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              "{alert.search_query}" 
                              {alert.location && ` in ${alert.location}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{alert.frequency}</Badge>
                              {alert.remote_only && (
                                <Badge variant="secondary" className="text-xs">Remote Only</Badge>
                              )}
                              <span className="text-xs text-gray-400">
                                {alert.jobs_sent_count} jobs sent
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleAlert(alert.id)}
                          >
                            {alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stats Cards */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Saved Jobs</p>
                    <p className="text-3xl font-bold">{savedJobs.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Applications</p>
                    <p className="text-3xl font-bold">{applications.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Alerts</p>
                    <p className="text-3xl font-bold">{jobAlerts.filter(a => a.is_active).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <BellRing className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Resume Score</p>
                    <p className="text-3xl font-bold">{resumeAnalysis?.overall_score || '--'}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No saved jobs yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <CompanyLogo company={job.company} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.company}</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applications tracked yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <CompanyLogo company={app.job.company} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{app.job.title}</p>
                          <p className="text-xs text-gray-500">{app.job.company}</p>
                        </div>
                        <Badge variant={app.status === 'applied' ? 'default' : 'secondary'}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Sign In' : 'Create Account'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' 
                ? 'Sign in to save jobs and track applications' 
                : 'Create an account to get started'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="john@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button 
              variant="ghost" 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            >
              {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
            </Button>
            <Button onClick={handleAuth} disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
            <DialogDescription>
              Get notified when new jobs match your search
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Query</Label>
              <Input 
                placeholder="e.g., React Developer"
                value={newAlert.search_query || search}
                onChange={(e) => setNewAlert(prev => ({ ...prev, search_query: e.target.value }))}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                placeholder="e.g., Remote"
                value={newAlert.location || location}
                onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select 
                value={newAlert.frequency} 
                onValueChange={(v) => setNewAlert(prev => ({ ...prev, frequency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button onClick={createJobAlert} disabled={!newAlert.search_query && !search}>
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>NextJob - AI-Powered Career Platform</p>
        <p className="mt-1">Built with Next.js, Tailwind CSS, and AI</p>
      </footer>
    </div>
  )
}
