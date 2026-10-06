import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit: 5 requests per IP per minute
  const rateCheck = await checkRateLimit(req, 'create-checkout', 5, 60);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSeconds!);
  }

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
      notes: body.notes || '',
    },
  });

  return NextResponse.json({ url: session.url });
}