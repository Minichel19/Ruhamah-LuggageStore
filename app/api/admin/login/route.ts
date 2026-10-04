import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { password } = await req.json();

  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('admin_password')
    .eq('id', 1)
    .single();

  const storedPassword = settings?.admin_password || process.env.ADMIN_PASSWORD;

  if (password !== storedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  (await cookies()).set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}