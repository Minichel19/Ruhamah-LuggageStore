import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session || (session.role !== 'owner' && session.role !== 'staff')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(200, parseInt(searchParams.get('limit') || '50'));
  const action = searchParams.get('action') || '';
  const staff = searchParams.get('staff') || '';
  const q = searchParams.get('q') || '';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (action) query = query.eq('action', action);
  if (staff) query = query.ilike('staff_email', `%${staff}%`);
  if (q) query = query.ilike('details', `%${q}%`);

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    logs: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  });
}