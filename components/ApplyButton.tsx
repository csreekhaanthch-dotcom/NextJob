'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
export default function ApplyButton({ jobId }: { jobId: number }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const handleApply = async () => {
    if (!session) { router.push('/api/auth/signin'); return; }
    setLoading(true); setMessage('');
    const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) });
    const data = await res.json();
    if (res.ok) { setMessage('Application successful! Check your dashboard.'); }
    else { setMessage(data.error); }
    setLoading(false);
  };
  return (
    <div className="mt-6">
      <button onClick={handleApply} disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
        {loading ? 'Applying...' : 'Apply for this Job'}
      </button>
      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
    </div>
  );
}
