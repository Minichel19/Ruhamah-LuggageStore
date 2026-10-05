import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  // Rate limit: block after 10 failed attempts in 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count: failedAttempts } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .eq('success', false)
    .gte('created_at', fiveMinAgo);

  if ((failedAttempts || 0) >= 10) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 5 minutes.' },
      { status: 429 }
    );
  }

  // Look up staff by email
  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  let valid = false;
  if (staff) {
    if (staff.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, staff.password);
    } else {
      valid = staff.password === password;
      if (valid) {
        const hashed = await bcrypt.hash(password, 10);
        await supabaseAdmin.from('staff').update({ password: hashed }).eq('id', staff.id);
      }
    }
  }

  await supabaseAdmin.from('login_attempts').insert({
    email: normalizedEmail,
    success: valid,
    ip: req.headers.get('x-forwarded-for') || 'unknown',
  });

  if (!valid || !staff) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin.from('sessions').insert({
    token,
    staff_id: staff.id,
    role: staff.role,
    expires_at: expiresAt,
  });

  (await cookies()).set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true, role: staff.role });
}