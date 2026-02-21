import { X, ChevronDown, ChevronUp, Briefcase, MapPin, Clock, DollarSign, Building, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Filters {
  jobTypes: string[];
  experienceLevels: string[];
  datePosted: string;
  salaryRange: string;
  workSettings: string[];
  industries: string[];
}

interface AdvancedFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearAll: () => void;
}

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time', icon: '💼' },
  { value: 'part-time', label: 'Part-time', icon: '⏰' },
  { value: 'contract', label: 'Contract', icon: '📋' },
  { value: 'freelance', label: 'Freelance', icon: '🚀' },
  { value: 'internship', label: 'Internship', icon: '🎓' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', count: '0-2 years' },
  { value: 'mid', label: 'Mid Level', count: '2-5 years' },
  { value: 'senior', label: 'Senior', count: '5-8 years' },
  { value: 'lead', label: 'Lead/Manager', count: '8+ years' },
  { value: 'executive', label: 'Executive', count: '10+ years' },
];

const DATE_POSTED = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
];

const SALARY_RANGES = [
  { value: '0-50', label: 'Under $50k' },
  { value: '50-75', label: '$50k - $75k' },
  { value: '75-100', label: '$75k - $100k' },
  { value: '100-150', label: '$100k - $150k' },
  { value: '150-200', label: '$150k - $200k' },
  { value: '200+', label: '$200k+' },
];

const WORK_SETTINGS = [
  { value: 'remote', label: 'Remote', icon: '🏠' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏢' },
  { value: 'on-site', label: 'On-site', icon: '🏬' },
];

export default function AdvancedFilters({ filters, onFilterChange, onClearAll }: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    jobTypes: true,
    experienceLevels: false,
    datePosted: true,
    salaryRange: false,
    workSettings: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category: keyof Filters, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [category]: newValues });
  };

  const handleRadioChange = (category: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [category]: value });
  };

  const FilterSection = ({ 
    title, 
    section, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    section: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );

  const activeFilterCount = 
    filters.jobTypes.length + 
    filters.experienceLevels.length + 
    (filters.datePosted ? 1 : 0) +
    (filters.salaryRange ? 1 : 0) +
    filters.workSettings.length +
    filters.industries.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <FilterSection title="Job Type" section="jobTypes" icon={Briefcase}>
          <div className="space-y-2">
            {JOB_TYPES.map(type => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.jobTypes.includes(type.value)}
                  onChange={() => handleCheckboxChange('jobTypes', type.value)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {type.icon} {type.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Experience Level" section="experienceLevels" icon={Building}>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map(level => (
              <label key={level.value} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.experienceLevels.includes(level.value)}
                    onChange={() => handleCheckboxChange('experienceLevels', level.value)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {level.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{level.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Date Posted" section="datePosted" icon={Clock}>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="datePosted"
                checked={!filters.datePosted}
                onChange={() => handleRadioChange('datePosted', '')}
                className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Any time</span>
            </label>
            {DATE_POSTED.map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="datePosted"
                  checked={filters.datePosted === option.value}
                  onChange={() => handleRadioChange('datePosted', option.value)}
                  className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Salary Range" section="salaryRange" icon={DollarSign}>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="salaryRange"
                checked={!filters.salaryRange}
                onChange={() => handleRadioChange('salaryRange', '')}
                className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Any salary</span>
            </label>
            {SALARY_RANGES.map(range => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="salaryRange"
                  checked={filters.salaryRange === range.value}
                  onChange={() => handleRadioChange('salaryRange', range.value)}
                  className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Work Setting" section="workSettings" icon={MapPin}>
          <div className="space-y-2">
            {WORK_SETTINGS.map(setting => (
              <label key={setting.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.workSettings.includes(setting.value)}
                  onChange={() => handleCheckboxChange('workSettings', setting.value)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {setting.icon} {setting.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
