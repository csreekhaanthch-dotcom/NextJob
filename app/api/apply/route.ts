import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  const { jobId } = await req.json();
  const { error } = await supabase.from('applications').insert({ user_id: user.id, job_id: jobId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Application successful' });
}
