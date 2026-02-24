import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) { const { jobId, ...reviewData } = await req.json(); const { error } = await supabase.from('company_reviews').insert({ job_id: jobId, ...reviewData }); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ message: 'Review submitted' }); }
