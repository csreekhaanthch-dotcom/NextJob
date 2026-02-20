import React from 'react';
import { Calendar, DollarSign, Briefcase, BarChart3, MapPin, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { JOB_TYPES, EXPERIENCE_LEVELS, DATE_POSTED_OPTIONS, SALARY_RANGES, WORK_SETTINGS } from '../data/skillsTaxonomy';

export interface AdvancedFiltersState {
  jobTypes: string[];
  experienceLevels: string[];
  datePosted: string;
  salaryRange: string;
  workSettings: string[];
  industries: string[];
  distance: number;
}

interface Props {
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

interface FilterOption {
  value: string;
  label: string;
}

const FilterSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-2"><span className="text-gray-500">{icon}</span><span className="font-medium text-gray-900 dark:text-white">{title}</span></div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const CheckboxGroup: React.FC<{ options: readonly FilterOption[]; selected: string[]; onChange: (v: string[]) => void }> = ({ options, selected, onChange }) => (
  <div className="space-y-2">
    {options.map((o: FilterOption) => (
      <label key={o.value} className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={selected.includes(o.value)} onChange={e => onChange(e.target.checked ? [...selected, o.value] : selected.filter(v => v !== o.value))} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{o.label}</span>
      </label>
    ))}
  </div>
);

const RadioGroup: React.FC<{ options: readonly FilterOption[]; selected: string; onChange: (v: string) => void }> = ({ options, selected, onChange }) => (
  <div className="space-y-2">
    {options.map((o: FilterOption) => (
      <label key={o.value} className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="filter" checked={selected === o.value} onChange={() => onChange(o.value)} className="w-4 h-4 border-gray-300 text-blue-600" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{o.label}</span>
      </label>
    ))}
  </div>
);

const AdvancedFilters: React.FC<Props> = ({ filters, onFiltersChange, onReset, activeFilterCount }) => {
  const update = <K extends keyof AdvancedFiltersState>(k: K, v: AdvancedFiltersState[K]) => onFiltersChange({ ...filters, [k]: v });
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
          {activeFilterCount > 0 && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 text-xs rounded-full">{activeFilterCount} active</span>}
        </div>
        {activeFilterCount > 0 && <button type="button" onClick={onReset} className="text-sm text-gray-600 hover:text-red-500 flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" />Reset</button>}
      </div>
      <FilterSection title="Date Posted" icon={<Calendar className="h-4 w-4" />}><RadioGroup options={DATE_POSTED_OPTIONS} selected={filters.datePosted} onChange={(v: string) => update('datePosted', v)} /></FilterSection>
      <FilterSection title="Job Type" icon={<Briefcase className="h-4 w-4" />}><CheckboxGroup options={JOB_TYPES} selected={filters.jobTypes} onChange={(v: string[]) => update('jobTypes', v)} /></FilterSection>
      <FilterSection title="Experience" icon={<BarChart3 className="h-4 w-4" />}><CheckboxGroup options={EXPERIENCE_LEVELS} selected={filters.experienceLevels} onChange={(v: string[]) => update('experienceLevels', v)} /></FilterSection>
      <FilterSection title="Salary" icon={<DollarSign className="h-4 w-4" />} defaultOpen={false}><RadioGroup options={SALARY_RANGES} selected={filters.salaryRange} onChange={(v: string) => update('salaryRange', v)} /></FilterSection>
      <FilterSection title="Work Setting" icon={<MapPin className="h-4 w-4" />}><CheckboxGroup options={WORK_SETTINGS} selected={filters.workSettings} onChange={(v: string[]) => update('workSettings', v)} /></FilterSection>
    </div>
  );
};

export default AdvancedFilters;
