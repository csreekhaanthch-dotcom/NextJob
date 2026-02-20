import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function useSearchHistory(maxItems: number = 10) {
  const STORAGE_KEY = 'nextjob-search-history';
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const addToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== searchTerm.toLowerCase());
      const updated = [searchTerm, ...filtered].slice(0, maxItems);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((searchTerm: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== searchTerm);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { searchHistory, addToHistory, removeFromHistory, clearHistory };
}

export function useKeyboardShortcuts(shortcuts: { key: string; handler: () => void }[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') return;
      }
      const shortcut = shortcuts.find(s => s.key.toLowerCase() === e.key.toLowerCase());
      if (shortcut) { e.preventDefault(); shortcut.handler(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
