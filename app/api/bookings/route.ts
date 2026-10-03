import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (sessionId) {
    const { data } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();
    return NextResponse.json({ booking: data });
  }

  const { data } = await supabaseAdmin.from('bookings').select('*').order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  await supabaseAdmin.from('bookings').update({ status }).eq('id', id);
  return NextResponse.json({ ok: true });
}