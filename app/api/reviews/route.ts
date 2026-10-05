import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('stars');

  const avg = allReviews && allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.stars, 0) / allReviews.length
    : 0;

  return NextResponse.json({
    reviews: data || [],
    average: avg,
    total: allReviews?.length || 0,
  });
}

export async function POST(req: Request) {
  const { bookingId, stars, comment, name } = await req.json();

  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Please select 1-5 stars' }, { status: 400 });
  }

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('reviews').insert({
    booking_id: bookingId || null,
    customer_name: name.trim(),
    stars,
    comment: comment || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}