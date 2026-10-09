import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { logAction } from '@/lib/audit';

export async function POST(req: Request) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  if (!staff) {
    return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  }

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');

  const { data: record } = await supabaseAdmin
    .from('two_factor_codes')
    .select('*')
    .eq('staff_id', staff.id)
    .eq('code_hash', codeHash)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Mark code as used
  await supabaseAdmin
    .from('two_factor_codes')
    .update({ used: true })
    .eq('id', record.id);

  // Create session
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

  // Log the successful login
  await logAction('LOGIN', `Logged in as ${staff.role}`, req);

  return NextResponse.json({ success: true, role: staff.role });
}