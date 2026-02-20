import React, { memo, useState } from 'react';
import { MapPin, Building, Calendar, DollarSign, ExternalLink, X, Globe, Users, TrendingUp, Briefcase } from 'lucide-react';
import { Job } from '../services/api';

interface JobCardProps {
  job: Job;
  viewMode?: 'grid' | 'list';
}

const getCompanyInitials = (companyName: string): string => {
  return companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const getCompanyColor = (companyName: string): string => {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatPostedDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const WorkSettingBadge: React.FC<{ setting?: string }> = ({ setting }) => {
  if (!setting) return null;
  const styles: Record<string, string> = {
    'remote': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'hybrid': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'on-site': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[setting] || ''}`}>
      <Globe className="h-3 w-3 mr-1" />{setting.charAt(0).toUpperCase() + setting.slice(1)}
    </span>
  );
};

const ExperienceBadge: React.FC<{ level?: string }> = ({ level }) => {
  if (!level) return null;
  const styles: Record<string, string> = {
    'entry': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'mid': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'senior': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'lead': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'executive': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };
  const labels: Record<string, string> = { 'entry': 'Entry', 'mid': 'Mid', 'senior': 'Senior', 'lead': 'Lead', 'executive': 'Executive' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[level] || ''}`}>
      <TrendingUp className="h-3 w-3 mr-1" />{labels[level] || level}
    </span>
  );
};

const JobPreviewModal: React.FC<{ job: Job; onClose: () => void }> = ({ job, onClose }) => {
  const companyColor = getCompanyColor(job.company);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${companyColor}`}>{getCompanyInitials(job.company)}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1"><Building className="h-4 w-4 mr-1" />{job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex flex-wrap gap-2 mb-4">
            <WorkSettingBadge setting={job.workSetting} />
            <ExperienceBadge level={job.experienceLevel} />
            {job.jobType && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"><Briefcase className="h-3 w-3 mr-1" />{job.jobType}</span>}
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600 dark:text-gray-400"><MapPin className="h-4 w-4 mr-2 text-blue-500" />{job.location}</div>
            <div className="flex items-center text-gray-600 dark:text-gray-400"><Calendar className="h-4 w-4 mr-2 text-green-500" />{formatPostedDate(job.posted_date)}</div>
            {job.salary && <div className="flex items-center text-gray-600 dark:text-gray-400"><DollarSign className="h-4 w-4 mr-2 text-purple-500" />{job.salary}</div>}
          </div>
          {(job.skills || job.tags) && (job.skills || job.tags)!.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {(job.skills || job.tags)!.map((tag, i) => <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">{tag}</span>)}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{job.description.replace(/<[^>]*>/g, '').substring(0, 1500)}{job.description.length > 1500 ? '...' : ''}</div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Now<ExternalLink className="h-4 w-4 ml-2" /></a>
        </div>
      </div>
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = memo(({ job, viewMode = 'grid' }) => {
  const [showModal, setShowModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const companyColor = getCompanyColor(job.company);
  const logoUrl = `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`;

  if (viewMode === 'list') {
    return (
      <>
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              {!logoError ? <img src={logoUrl} alt={`${job.company} logo`} className="w-12 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" onError={() => setLogoError(true)} loading="lazy" /> : <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${companyColor}`}>{getCompanyInitials(job.company)}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{job.company}</p>
                </div>
                {job.salary && <span className="text-green-600 dark:text-green-400 font-semibold text-sm whitespace-nowrap">{job.salary}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><MapPin className="h-3.5 w-3.5 mr-1" />{job.location}</div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><Calendar className="h-3.5 w-3.5 mr-1" />{formatPostedDate(job.posted_date)}</div>
                <WorkSettingBadge setting={job.workSetting} />
                <ExperienceBadge level={job.experienceLevel} />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowModal(true)} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">View</button>
              <button onClick={() => window.open(job.url, '_blank')} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Apply</button>
            </div>
          </div>
          {(job.skills || job.tags) && (job.skills || job.tags)!.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {(job.skills || job.tags)!.slice(0, 6).map((tag, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">{tag}</span>)}
            </div>
          )}
        </article>
        {showModal && <JobPreviewModal job={job} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all h-full flex flex-col">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start gap-3 mb-3">
            {!logoError ? <img src={logoUrl} alt={`${job.company} logo`} className="w-11 h-11 rounded-lg object-contain border border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-700" onError={() => setLogoError(true)} loading="lazy" /> : <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${companyColor}`}>{getCompanyInitials(job.company)}</div>}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{job.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mt-0.5"><Building className="h-3.5 w-3.5 mr-1" /><span className="truncate">{job.company}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <WorkSettingBadge setting={job.workSetting} />
            <ExperienceBadge level={job.experienceLevel} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5 mr-1" /><span className="truncate max-w-[150px]">{job.location}</span></div>
            <div className="flex items-center text-gray-500 dark:text-gray-400"><Calendar className="h-3.5 w-3.5 mr-1" />{formatPostedDate(job.posted_date)}</div>
          </div>
          {job.salary && <div className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-3"><DollarSign className="h-4 w-4 mr-1" />{job.salary}</div>}
          {job.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 flex-1">{job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>}
          {(job.skills || job.tags) && (job.skills || job.tags)!.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(job.skills || job.tags)!.slice(0, 4).map((tag, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">{tag}</span>)}
            </div>
          )}
          <div className="flex gap-2 mt-auto pt-2">
            <button onClick={() => setShowModal(true)} className="flex-1 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Quick View</button>
            <button onClick={() => window.open(job.url, '_blank')} className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Apply Now</button>
          </div>
        </div>
      </article>
      {showModal && <JobPreviewModal job={job} onClose={() => setShowModal(false)} />}
    </>
  );
});

JobCard.displayName = 'JobCard';
export default JobCard;
