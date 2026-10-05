import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import ExcelJS from 'exceljs';

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

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ruhamah LuggageStore';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Bookings', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Define columns
  sheet.columns = [
    { header: 'Booking ID', key: 'id', width: 38 },
    { header: 'Customer Name', key: 'name', width: 22 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Drop-off Date', key: 'dropoff', width: 16 },
    { header: 'Pick-up Date', key: 'pickup', width: 16 },
    { header: 'Bags', key: 'bags', width: 8 },
    { header: 'Total ($)', key: 'total', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Photo URL', key: 'photo', width: 50 },
    { header: 'Created At', key: 'created', width: 22 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' },
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 22;

  // Add bookings
  bookings.forEach(b => {
    sheet.addRow({
      id: b.id,
      name: b.customer_name || '',
      email: b.customer_email || '',
      phone: b.customer_phone || '',
      dropoff: b.dropoff_date || '',
      pickup: b.pickup_date || '',
      bags: b.bag_count || 0,
      total: Number(b.total_price) || 0,
      status: b.status || '',
      notes: b.notes || '',
      photo: b.photo_url || '',
      created: b.created_at ? new Date(b.created_at).toLocaleString() : '',
    });
  });

  // Add totals row
  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0);
  const totalBags = bookings.reduce((s, b) => s + (b.bag_count || 0), 0);

  const totalsRow = sheet.addRow({
    name: 'TOTAL',
    bags: totalBags,
    total: totalRevenue,
  });
  totalsRow.font = { bold: true };

  // Format currency column
  sheet.getColumn('total').numFmt = '$#,##0.00';

  // Add an analytics summary sheet
  const summary = workbook.addWorksheet('Summary');
  summary.addRow(['Ruhamah LuggageStore — Summary']);
  summary.getRow(1).font = { bold: true, size: 16 };
  summary.addRow([]);
  summary.addRow(['Total Bookings', bookings.length]);
  summary.addRow(['Total Bags Stored', totalBags]);
  summary.addRow(['Total Revenue', totalRevenue]);
  summary.getRow(5).getCell(2).numFmt = '$#,##0.00';
  summary.addRow([]);
  summary.addRow(['Status', 'Count']);
  summary.getRow(7).font = { bold: true };
  summary.addRow(['Paid (awaiting drop-off)', bookings.filter(b => b.status === 'paid').length]);
  summary.addRow(['Currently Stored', bookings.filter(b => b.status === 'stored').length]);
  summary.addRow(['Picked Up', bookings.filter(b => b.status === 'picked_up').length]);
  summary.getColumn(1).width = 30;
  summary.getColumn(2).width = 20;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `bookings-${new Date().toISOString().split('T')[0]}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}