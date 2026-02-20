import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Code } from 'lucide-react';
import { searchSkills, popularSkills, skillsTaxonomy } from '../data/skillsTaxonomy';

interface Props {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
}

const SkillsAutocomplete: React.FC<Props> = ({ selectedSkills, onSkillsChange, placeholder = "Search skills...", maxSkills = 10 }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ skill: string; category: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setSuggestions(searchSkills(query, 8).filter(r => !selectedSkills.includes(r.skill)));
    } else {
      setSuggestions(popularSkills.filter(s => !selectedSkills.includes(s)).slice(0, 8).map(s => {
        const found = skillsTaxonomy.find(c => c.skills.includes(s));
        return { skill: s, category: found?.name || 'Other' };
      }));
    }
  }, [query, selectedSkills]);

  const handleSelect = (skill: string) => {
    if (selectedSkills.length < maxSkills && !selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
        {selectedSkills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-md">
            {skill}
            <button type="button" onClick={() => onSkillsChange(selectedSkills.filter(s => s !== skill))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="h-3 w-3" /></button>
          </span>
        ))}
        {selectedSkills.length < maxSkills && (
          <input ref={inputRef} type="text" value={query} onChange={e => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder={selectedSkills.length === 0 ? placeholder : "Add more..."} className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400" />
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!query && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-900">Popular Skills</div>}
          {suggestions.map(s => (
            <button key={s.skill} type="button" onClick={() => handleSelect(s.skill)} className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{s.skill}</span>
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsAutocomplete;
