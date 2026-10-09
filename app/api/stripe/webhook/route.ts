import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase';
import { sendBookingConfirmation, sendOwnerNotification } from '@/lib/email/send';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const m = session.metadata || {};

    // ─── CASE 1: extra bags payment link ─────────────────────
    if (m.type === 'extra_bags' && m.booking_id) {
      const addedBags = parseInt(m.added_bags || '0');
      const amount = (session.amount_total || 0) / 100;
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;

      const { data: existing } = await supabaseAdmin
        .from('bookings')
        .select('amount_charged_extra')
        .eq('id', m.booking_id)
        .single();

      const newCharged = Number(existing?.amount_charged_extra || 0) + amount;

      await supabaseAdmin
        .from('bookings')
        .update({
          amount_charged_extra: newCharged,
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq('id', m.booking_id);

      await supabaseAdmin.from('audit_logs').insert({
        staff_id: null,
        staff_email: 'system',
        action: 'BAGS_CHARGED',
        details: `Extra bags paid: +${addedBags} · $${amount.toFixed(2)} · ${paymentIntentId || 'no PI'}`,
        ip: 'stripe-webhook',
      });

      return NextResponse.json({ received: true });
    }

    // ─── CASE 2: brand-new booking ───────────────────────────
    const qrCode = await QRCode.toDataURL(session.id);

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('price_per_bag')
      .eq('id', 1)
      .single();

    const bagCount = parseInt(m.bags);
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

    // ─── Retrieve saved card + customer for future off-session charges ──
    let paymentMethodId: string | null = null;
    let customerId: string | null = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id || null;

    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method'],
        });

        paymentMethodId = typeof pi.payment_method === 'string'
          ? pi.payment_method
          : (pi.payment_method as any)?.id || null;

        if (!customerId && pi.customer) {
          customerId = typeof pi.customer === 'string'
            ? pi.customer
            : (pi.customer as any).id || null;
        }
      } catch (err) {
        console.error('Failed to retrieve PaymentIntent for saved card:', err);
      }
    }

    const booking = {
      customer_name: m.name,
      customer_email: m.email,
      customer_phone: m.phone,
      dropoff_date: m.dropoff,
      pickup_date: m.pickup,
      bag_count: bagCount,
      bags_actual: bagCount,
      price_per_bag: settings?.price_per_bag ?? null,
      total_price: session.amount_total! / 100,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: customerId,
      stripe_payment_method_id: paymentMethodId,
      qr_code: qrCode,
      status: 'paid',
      notes: m.notes || null,
    };

    const { data: saved, error: insertErr } = await supabaseAdmin
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (insertErr) {
      console.error('Failed to insert booking:', insertErr);
    }

    if (saved) {
      await sendBookingConfirmation(saved);
      await sendOwnerNotification(saved);
    }
  }

  return NextResponse.json({ received: true });
}