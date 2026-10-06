import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendTwoFactorCode } from '@/lib/email/send';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  // Rate limit: 10 failed attempts in 5 minutes
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

  // Generate 6-digit 2FA code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Clear any old unused codes for this staff
  await supabaseAdmin
    .from('two_factor_codes')
    .delete()
    .eq('staff_id', staff.id)
    .eq('used', false);

  await supabaseAdmin.from('two_factor_codes').insert({
    staff_id: staff.id,
    code_hash: codeHash,
    expires_at: expiresAt,
  });

  // Send the code via email
  await sendTwoFactorCode(staff.email, staff.name || 'there', code);

  return NextResponse.json({
    success: true,
    requires_2fa: true,
    email: staff.email,
  });
}