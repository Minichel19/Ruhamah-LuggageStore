import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const m = session.metadata;
    const qrCode = await QRCode.toDataURL(session.id);

    await supabaseAdmin.from('bookings').insert({
      customer_name: m.name,
      customer_email: m.email,
      customer_phone: m.phone,
      dropoff_date: m.dropoff,
      pickup_date: m.pickup,
      bag_count: parseInt(m.bags),
      total_price: session.amount_total / 100,
      stripe_session_id: session.id,
      qr_code: qrCode,
      status: 'paid',
    });
  }

  return NextResponse.json({ received: true });
}