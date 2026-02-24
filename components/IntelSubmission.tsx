'use client';
import { useState } from 'react';
export default function IntelSubmission({ jobId }: { jobId: number }) {
  const [review, setReview] = useState({ work_life_balance: 3, culture: 3, management: 3, review_text: '' });
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const handleReviewSubmit = async (e: React.FormEvent) => { e.preventDefault(); setMessage(''); const res = await fetch('/api/intel/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...review, jobId }) }); setMessage(res.ok ? 'Review submitted!' : 'Error.'); setReview({ work_life_balance: 3, culture: 3, management: 3, review_text: '' }); };
  const handleQuestionSubmit = async (e: React.FormEvent) => { e.preventDefault(); setMessage(''); const res = await fetch('/api/intel/question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, jobId }) }); setMessage(res.ok ? 'Question submitted!' : 'Error.'); setQuestion(''); };
  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Share Your Intel (Anonymous)</h3>
      <form onSubmit={handleReviewSubmit} className="mb-6 space-y-3">
        <h4 className="font-semibold">Submit a Review</h4>
        <div className="flex gap-4"><label>WL Balance (1-5):</label><input type="number" min="1" max="5" value={review.work_life_balance} onChange={(e) => setReview({...review, work_life_balance: parseInt(e.target.value)})} className="border p-1 w-16"/></div>
        <div className="flex gap-4"><label>Culture (1-5):</label><input type="number" min="1" max="5" value={review.culture} onChange={(e) => setReview({...review, culture: parseInt(e.target.value)})} className="border p-1 w-16"/></div>
        <div className="flex gap-4"><label>Management (1-5):</label><input type="number" min="1" max="5" value={review.management} onChange={(e) => setReview({...review, management: parseInt(e.target.value)})} className="border p-1 w-16"/></div>
        <textarea className="w-full p-2 border" value={review.review_text} onChange={(e) => setReview({...review, review_text: e.target.value})} placeholder="Write your review..."/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Review</button>
      </form>
      <form onSubmit={handleQuestionSubmit} className="space-y-3">
        <h4 className="font-semibold">Submit an Interview Question</h4>
        <textarea className="w-full p-2 border" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What question were you asked?"/>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Question</button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
