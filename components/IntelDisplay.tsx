'use client';
import { useState, useEffect } from 'react';
type Review = { work_life_balance: number; culture: number; management: number; review_text: string; };
type Question = { question: string; };
export default function IntelDisplay({ jobId }: { jobId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  useEffect(() => {
    fetch(`/api/intel/reviews?jobId=${jobId}`).then(res => res.json()).then(setReviews);
    fetch(`/api/intel/questions?jobId=${jobId}`).then(res => res.json()).then(setQuestions);
  }, [jobId]);
  return (
    <div className="mt-8 p-4 border rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Company Intel</h3>
      <div className="mb-6"><h4 className="font-semibold">Reviews</h4>{reviews.length > 0 ? reviews.map((r, i) => <div key={i} className="mt-2 p-2 bg-gray-100 rounded"><p>WL: {r.work_life_balance}/5, Culture: {r.culture}/5, Mgmt: {r.management}/5</p><p className="text-sm">{r.review_text}</p></div>) : <p className="text-gray-500">No reviews yet.</p>}</div>
      <div><h4 className="font-semibold">Interview Questions</h4>{questions.length > 0 ? questions.map((q, i) => <p key={i} className="mt-2 p-2 bg-gray-100 rounded">- {q.question}</p>) : <p className="text-gray-500">No questions yet.</p>}</div>
    </div>
  );
}
