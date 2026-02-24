'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import JobCard from '@/components/JobCard';
import Link from 'next/link';

type Job = { 
  id: number; 
  title: string; 
  company: string; 
  location: string; 
  description: string; 
  similarity?: number; 
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/jobs/matches')
        .then(res => res.json())
        // FIX: We use data.data to get the actual array
        .then(data => setJobs(data.data)); 
    } else if (status === 'unauthenticated') {
      fetch('/api/jobs/list')
        .then(res => res.json())
        // FIX: We use data.data here as well
        .then(data => setJobs(data.data));
    }
  }, [status]);

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{session && jobs.length > 0 ? 'Top Matches For You' : 'Latest Jobs'}</h1>
        {session ? <Link href="/profile" className="text-blue-600 hover:underline">Update Profile</Link> : <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded">Sign In</Link>}
      </div>
      {/* FIX: Added a safety check to prevent errors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs && Array.isArray(jobs) && jobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );
}