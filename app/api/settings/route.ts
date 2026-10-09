export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  const { data } = await supabaseAdmin.from('settings').select('*').single();
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session || session.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can update settings' }, { status: 403 });
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
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      store_photo_url: body.store_photo_url,
    })
    .eq('id', 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}