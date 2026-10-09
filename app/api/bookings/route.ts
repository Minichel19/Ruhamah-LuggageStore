import { logAction } from '@/lib/audit';
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
  const id = searchParams.get('id');

  // ─── Fetch a single booking by id ───────────────────────────
  if (id) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking: data });
  }

  // ─── Fetch a single booking by Stripe session id ────────────
  if (sessionId) {
    const { data } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();
    return NextResponse.json({ booking: data });
  }

  // ─── List all bookings (default) ────────────────────────────
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

  if (updated) {
    await logAction(
      'BOOKING_STATUS',
      `Marked ${updated.customer_name}'s booking as "${status}"`,
      req
    );
  }

  if (status === 'picked_up' && updated) {
    await sendReviewRequest(updated);
  }

  return NextResponse.json({ ok: true });
}