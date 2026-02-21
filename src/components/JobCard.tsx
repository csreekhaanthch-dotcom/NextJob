import { MapPin, Building2, Clock, DollarSign, ExternalLink, Bookmark, BookmarkCheck, Briefcase, Globe } from 'lucide-react';
import { Job } from '../services/api';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  viewMode?: 'grid' | 'list';
  onBookmark?: (jobId: string) => void;
  isBookmarked?: boolean;
}

const SourceBadge = ({ source }: { source: string }) => {
  const colors: Record<string, string> = {
    'Remotive': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Arbeitnow': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    'Adzuna': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'JSearch': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  const baseSource = source?.split(' - ')[0] || 'Unknown';
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[baseSource] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
      {baseSource}
    </span>
  );
};

const JobTypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;
  const typeColors: Record<string, string> = {
    'Full-time': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    'Part-time': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    'Contract': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    'Remote': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${typeColors[type] || 'bg-gray-50 text-gray-600'}`}>
      {type}
    </span>
  );
};

const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return 'Recently';
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').substring(0, 200) + (html.length > 200 ? '...' : '');
};

export default function JobCard({ job, viewMode = 'grid', onBookmark, isBookmarked }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const companyLogo = `https://logo.clearbit.com/${job.company?.toLowerCase().replace(/[^a-z0-9]/g, '')}.com?size=80`;

  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {job.company?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{job.company}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <SourceBadge source={job.source} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.salary && (
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    {job.salary}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(job.posted_date)}
              </span>
              {job.job_type && (
                <JobTypeBadge type={job.job_type} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => onBookmark?.(job.id)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-indigo-600" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              Apply <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-5">
        {/* Company Logo & Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            {job.company?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">{job.company}</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatTimeAgo(job.posted_date)}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-semibold">{job.salary}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <SourceBadge source={job.source} />
          {job.job_type && <JobTypeBadge type={job.job_type} />}
          {job.is_remote && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Remote
            </span>
          )}
        </div>

        {/* Description Preview */}
        {job.description && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {stripHtml(job.description)}
          </p>
        )}

        {/* Actions */}
        <div className={`mt-4 flex items-center gap-2 transition-all ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <button
            onClick={() => onBookmark?.(job.id)}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={isBookmarked ? 'Remove bookmark' : 'Save job'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            Apply Now <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
