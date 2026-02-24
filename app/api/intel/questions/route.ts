import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function GET(req: Request) { const { searchParams } = new URL(req.url); const jobId = searchParams.get('jobId'); const { data, error } = await supabase.from('interview_questions').select('*').eq('job_id', jobId); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json(data); }
