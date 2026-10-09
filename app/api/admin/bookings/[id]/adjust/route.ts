import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';
import { sendExtraBagsLink } from '@/lib/email/send';

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

  const body = await req.json();
  const bagsActual = parseInt(body.bags_actual);
  if (isNaN(bagsActual) || bagsActual < 0) {
    return NextResponse.json({ error: 'Invalid bags_actual' }, { status: 400 });
  }

  const { data: booking, error: bErr } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (bErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const booked = booking.bag_count || 0;
  const currentActual = booking.bags_actual ?? booked;
  const pricePerBag = Number(booking.price_per_bag || 0);
  const delta = bagsActual - booked;

  // same → no-op
  if (bagsActual === currentActual) {
    return NextResponse.json({ ok: true, changed: false });
  }

  // Charge handled elsewhere (charge-card endpoint) — just record bags_actual
  if (body.skip_charge) {
    await supabaseAdmin
      .from('bookings')
      .update({ bags_actual: bagsActual })
      .eq('id', booking.id);
    return NextResponse.json({ ok: true, changed: true, skipped_charge: true });
  }

  // ─── EXTRA BAGS → payment link ──────────────────────────────
  if (delta > 0) {
    const amountDue = delta * pricePerBag;
    if (amountDue <= 0) {
      return NextResponse.json({ error: 'Price per bag not set' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(pricePerBag * 100),
            product_data: {
              name: `Extra bag × ${delta}`,
              description: `Additional bags for booking ${booking.id.slice(0, 8)}`,
            },
          },
          quantity: delta,
        },
      ],
      customer_email: booking.customer_email,
      metadata: {
        type: 'extra_bags',
        booking_id: booking.id,
        added_bags: String(delta),
      },
      success_url: `${baseUrl}/?bags=paid`,
      cancel_url: `${baseUrl}/?bags=cancelled`,
    });

    await supabaseAdmin
      .from('bookings')
      .update({ bags_actual: bagsActual })
      .eq('id', booking.id);

    await sendExtraBagsLink(booking, delta, amountDue, checkout.url!);

    await logAction(
      'BAGS_ADDED',
      `${booked} → ${bagsActual} bags · payment link sent for $${amountDue.toFixed(2)}`,
      req
    );

    return NextResponse.json({
      ok: true,
      type: 'payment_link',
      url: checkout.url,
      amount_due: amountDue,
      delta,
    });
  }

  // ─── FEWER BAGS → refund ────────────────────────────────────
  const refundAmount = Math.abs(delta) * pricePerBag;

  if (booking.stripe_payment_intent_id && refundAmount > 0) {
    try {
      await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100),
      });

      await supabaseAdmin
        .from('bookings')
        .update({
          bags_actual: bagsActual,
          amount_refunded: Number(booking.amount_refunded || 0) + refundAmount,
        })
        .eq('id', booking.id);

      await logAction(
        'BAGS_REMOVED',
        `${booked} → ${bagsActual} bags · refunded $${refundAmount.toFixed(2)}`,
        req
      );

      return NextResponse.json({
        ok: true,
        type: 'refund',
        amount_refunded: refundAmount,
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Refund failed: ${err.message}` },
        { status: 500 }
      );
    }
  }

  // no PI on file — just record
  await supabaseAdmin
    .from('bookings')
    .update({ bags_actual: bagsActual })
    .eq('id', booking.id);

  await logAction(
    'BAGS_REMOVED',
    `${booked} → ${bagsActual} bags · no refund (no PI on file)`,
    req
  );

  return NextResponse.json({ ok: true, type: 'recorded_only' });
}