import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

export async function POST() {
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
    return NextResponse.json({ error: 'Only owners' }, { status: 403 });
  }

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ error: 'No bookings to backup' }, { status: 404 });
  }

  const headers = [
    'Booking ID', 'Customer Name', 'Email', 'Phone',
    'Drop-off', 'Pick-up', 'Bags', 'Total ($)', 'Status',
    'Notes', 'Photo URL', 'Created At',
  ];

  const rows = bookings.map(b => [
    b.id,
    b.customer_name || '',
    b.customer_email || '',
    b.customer_phone || '',
    b.dropoff_date || '',
    b.pickup_date || '',
    b.bag_count || 0,
    b.total_price || 0,
    b.status || '',
    (b.notes || '').replace(/[\n\r,]/g, ' '),
    b.photo_url || '',
    b.created_at || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const date = new Date().toISOString().split('T')[0];

    await resend.emails.send({
      from: 'Ruhamah LuggageStore <hello@updates.lugagestore.com>',
      to: 'minichelgera@gmail.com',
      subject: `Backup — ${bookings.length} bookings (${date})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a;">Booking Data Backup</h1>
          <p>Your booking data backup is attached below as CSV.</p>
          <p><strong>Total bookings:</strong> ${bookings.length}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p>Save this email as a backup. You can open the CSV in Excel.</p>
        </div>
      `,
      attachments: [
        {
          filename: `bookings-backup-${date}.csv`,
          content: Buffer.from(csv).toString('base64'),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      bookings: bookings.length,
      message: 'Backup sent to your email',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}