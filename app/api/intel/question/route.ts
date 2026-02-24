import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) { const { jobId, question } = await req.json(); const { error } = await supabase.from('interview_questions').insert({ job_id: jobId, question }); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ message: 'Question submitted' }); }
