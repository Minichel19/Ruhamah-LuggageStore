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

  // Look up staff by email
  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  // Verify password (supports both hashed and legacy plain-text)
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

  // Log the attempt (but don't rate limit)
  await supabaseAdmin.from('login_attempts').insert({
    email: normalizedEmail,
    success: valid,
    ip: req.headers.get('x-forwarded-for') || 'unknown',
  });

  if (!valid || !staff) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create a secure random session token
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