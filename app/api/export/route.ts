import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ error: 'No bookings' }, { status: 404 });
  }

  // Build CSV
  const headers = [
    'Booking ID',
    'Customer Name',
    'Email',
    'Phone',
    'Drop-off Date',
    'Pick-up Date',
    'Bags',
    'Total ($)',
    'Status',
    'Notes',
    'Photo URL',
    'Created At',
  ];

  const rows = bookings.map(b => [
    b.id,
    b.customer_name,
    b.customer_email,
    b.customer_phone || '',
    b.dropoff_date,
    b.pickup_date,
    b.bag_count,
    b.total_price,
    b.status,
    (b.notes || '').replace(/[\n\r,]/g, ' '),
    b.photo_url || '',
    b.created_at,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const filename = `bookings-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}