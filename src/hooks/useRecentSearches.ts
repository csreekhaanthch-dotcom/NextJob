import { useState, useEffect } from 'react';

const HISTORY_KEY = 'nextjob_search_history';
const MAX_HISTORY = 10;

export function useRecentSearches() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {
      console.error('Error loading search history:', e);
    }
  }, []);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (query: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h !== query);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
}
