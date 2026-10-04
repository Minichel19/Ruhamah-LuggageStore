import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function isOwner() {
  const session = (await cookies()).get('admin_session');
  return session?.value?.startsWith('owner');
}

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data } = await supabaseAdmin
    .from('staff')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('staff').insert({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'staff',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('staff').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}