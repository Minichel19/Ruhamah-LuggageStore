import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.json();

  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Luggage Storage — ${body.bags} bag(s)` },
        unit_amount: Math.round(body.total * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
    metadata: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      dropoff: body.dropoff,
      pickup: body.pickup,
      bags: body.bags.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}