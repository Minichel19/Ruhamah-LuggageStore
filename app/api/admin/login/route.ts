import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  // Check staff table
  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('password', password)
    .single();

  if (staff) {
    (await cookies()).set('admin_session', `${staff.role}-${staff.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return NextResponse.json({ success: true, role: staff.role });
  }

  // Fallback: old single password (owner backup)
  if (password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set('admin_session', 'owner-backup', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return NextResponse.json({ success: true, role: 'owner' });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}