import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  const { data } = await supabaseAdmin.from('settings').select('*').single();
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = (await cookies()).get('admin_session');
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { error } = await supabaseAdmin
    .from('settings')
    .update({
      opening_time: body.opening_time,
      closing_time: body.closing_time,
      price_per_bag: body.price_per_bag,
      is_closed: body.is_closed,
      closed_message: body.closed_message,
      special_hours: body.special_hours,
    })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}