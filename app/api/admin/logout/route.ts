import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export async function POST(req: Request) {
  const token = (await cookies()).get('admin_session')?.value;

  await logAction('LOGOUT', 'User logged out', req);

  if (token) {
    await supabaseAdmin.from('sessions').delete().eq('token', token);
  }

  (await cookies()).delete('admin_session');
  return NextResponse.json({ success: true });
}