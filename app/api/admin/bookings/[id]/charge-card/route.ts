import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session || (session.role !== 'owner' && session.role !== 'staff')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { data: booking, error: bErr } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (bErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (!booking.stripe_customer_id || !booking.stripe_payment_method_id) {
    return NextResponse.json(
      { error: 'No saved card on file. Use Send payment link instead.' },
      { status: 400 }
    );
  }

  const booked = booking.bag_count || 0;
  const actual = booking.bags_actual ?? booked;
  const pricePerBag = Number(booking.price_per_bag || 0);
  const delta = actual - booked;

  if (delta <= 0) {
    return NextResponse.json({ error: 'No extra bags to charge for' }, { status: 400 });
  }

  const amountDue = delta * pricePerBag;
  if (amountDue <= 0) {
    return NextResponse.json({ error: 'Price per bag not set' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountDue * 100),
      currency: 'usd',
      customer: booking.stripe_customer_id,
      payment_method: booking.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `Extra bags × ${delta} for booking ${booking.id.slice(0, 8)}`,
      metadata: {
        type: 'extra_bags_off_session',
        booking_id: booking.id,
        added_bags: String(delta),
      },
    });

    const newCharged = Number(booking.amount_charged_extra || 0) + amountDue;

    await supabaseAdmin
      .from('bookings')
      .update({
        amount_charged_extra: newCharged,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', booking.id);

    await logAction(
      'BAGS_CHARGED',
      `Extra bags charged off-session: +${delta} · $${amountDue.toFixed(2)} · ${paymentIntent.id}`,
      req
    );

    return NextResponse.json({
      ok: true,
      payment_intent: paymentIntent.id,
      amount_charged: amountDue,
      status: paymentIntent.status,
    });
  } catch (err: any) {
    if (err.code === 'authentication_required') {
      return NextResponse.json(
        { error: 'Card requires authentication. Use Send payment link instead.', code: 'authentication_required' },
        { status: 402 }
      );
    }

    await logAction('BAGS_CHARGE_FAILED', `Charge failed: ${err.message}`, req);

    return NextResponse.json(
      { error: `Charge failed: ${err.message}` },
      { status: 500 }
    );
  }
}