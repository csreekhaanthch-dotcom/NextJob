import React, { memo, useState } from 'react';
import { MapPin, Building, Calendar, DollarSign, ExternalLink, X } from 'lucide-react';
import { Job } from '../services/api';

interface JobCardProps { job: Job; }

const getCompanyInitials = (companyName: string): string => {
  return companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getCompanyColor = (companyName: string): string => {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) { hash = companyName.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
};

const formatPostedDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const JobPreviewModal: React.FC<{ job: Job; onClose: () => void }> = ({ job, onClose }) => {
  const companyColor = getCompanyColor(job.company);
  const initials = getCompanyInitials(job.company);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${companyColor}`}>{initials}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1"><Building className="h-4 w-4 mr-1" />{job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600 dark:text-gray-400"><MapPin className="h-4 w-4 mr-2 text-blue-500" />{job.location}</div>
            <div className="flex items-center text-gray-600 dark:text-gray-400"><Calendar className="h-4 w-4 mr-2 text-green-500" />{formatPostedDate(job.posted_date)}</div>
            {job.salary && <div className="flex items-center text-gray-600 dark:text-gray-400"><DollarSign className="h-4 w-4 mr-2 text-purple-500" />{job.salary}</div>}
          </div>
          {job.tags && job.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-6">{job.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">{tag}</span>)}</div>}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: job.description.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').substring(0, 1500) + (job.description.length > 1500 ? '...' : '') }} />
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Now<ExternalLink className="h-4 w-4 ml-2" /></a>
        </div>
      </div>
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = memo(({ job }) => {
  const [showModal, setShowModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const companyColor = getCompanyColor(job.company);
  const initials = getCompanyInitials(job.company);
  const logoUrl = `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`;

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden job-card transition-all duration-200 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500">
        <div className="p-6">
          <div className="flex items-start mb-4">
            {!logoError ? (
              <img src={logoUrl} alt={`${job.company} logo`} className="w-12 h-12 rounded-lg object-contain mr-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" onError={() => setLogoError(true)} loading="lazy" />
            ) : (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4 ${companyColor}`}>{initials}</div>
            )}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">{job.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1"><Building className="h-4 w-4 mr-1" />{job.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><MapPin className="h-4 w-4 mr-1" /><span className="truncate">{job.location}</span></div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><Calendar className="h-4 w-4 mr-1" />{formatPostedDate(job.posted_date)}</div>
            {job.salary && <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm"><DollarSign className="h-4 w-4 mr-1" />{job.salary}</div>}
          </div>
          {job.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.slice(0, 5).map((tag, i) => <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">{tag}</span>)}
              {job.tags.length > 5 && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">+{job.tags.length - 5} more</span>}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(true)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Quick View</button>
            <button onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Apply Now</button>
          </div>
        </div>
      </article>
      {showModal && <JobPreviewModal job={job} onClose={() => setShowModal(false)} />}
    </>
  );
});

JobCard.displayName = 'JobCard';
export default JobCard;