import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { sendReviewRequest } from '@/lib/email/send';

async function isAuthenticated() {
  const session = (await cookies()).get('admin_session');
  return !!session?.value;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const { data } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, status } = await req.json();

  const { data: updated } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  // Auto-send review request email when marked as picked up
  if (status === 'picked_up' && updated) {
    await sendReviewRequest(updated);
  }

  return NextResponse.json({ ok: true });
}