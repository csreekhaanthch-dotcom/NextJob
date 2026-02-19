import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JobCard from '../components/JobCard';

interface Job {
  _id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  posted_date: number;
  tags?: string[];
}

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/bookmarks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        
        const data = await response.json();
        setBookmarks(data.bookmarks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [isAuthenticated]);
  
  const removeBookmark = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookmarks/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
      
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Favorite Jobs</h2>
          <p className="text-gray-600 mb-6">
            Sign in to bookmark jobs and access them anytime
          </p>
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('openLoginModal', { detail: 'login' }))}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In to View Bookmarks
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800 font-medium mb-2">Error Loading Bookmarks</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookmarked Jobs</h1>
        <p className="text-gray-600">
          {bookmarks.length} saved {bookmarks.length === 1 ? 'job' : 'jobs'}
        </p>
      </div>
      
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((job) => (
            <div key={job._id} className="relative">
              <JobCard 
                job={{
                  id: job.jobId,
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  description: job.description,
                  url: job.url,
                  salary: job.salary,
                  posted_date: job.posted_date,
                  tags: job.tags
                }} 
              />
              <button
                onClick={() => removeBookmark(job._id)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Remove bookmark"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 p-8 rounded-xl max-w-md mx-auto">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 mb-4">
              Save jobs you're interested in by clicking the bookmark icon on job cards
            </p>
            <a 
              href="/jobs" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;