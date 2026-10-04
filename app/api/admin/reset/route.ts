import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { resetCode, newPassword } = await req.json();

  if (resetCode !== process.env.ADMIN_RESET_CODE) {
    return NextResponse.json({ error: 'Invalid reset code' }, { status: 401 });
  }

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('settings')
    .update({ admin_password: newPassword })
    .eq('id', 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}