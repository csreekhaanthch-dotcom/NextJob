import { useState, useEffect } from 'react';
import { Job } from '../services/api';

const BOOKMARKS_KEY = 'nextjob_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Job[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch (e) {
      console.error('Error loading bookmarks:', e);
    }
  }, []);

  const toggleBookmark = (job: Job) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === job.id);
      const updated = exists 
        ? prev.filter(b => b.id !== job.id)
        : [...prev, job];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (jobId: string) => bookmarks.some(b => b.id === jobId);

  return { bookmarks, toggleBookmark, isBookmarked };
}
