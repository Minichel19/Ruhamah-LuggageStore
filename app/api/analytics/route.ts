import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  const session = (await cookies()).get('admin_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (!bookings) {
    return NextResponse.json({ error: 'No data' }, { status: 500 });
  }

  // ---- Totals ----
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const totalBookings = bookings.length;
  const totalBags = bookings.reduce((sum, b) => sum + (b.bag_count || 0), 0);

  // ---- By status ----
  const statusCounts = {
    paid: bookings.filter(b => b.status === 'paid').length,
    stored: bookings.filter(b => b.status === 'stored').length,
    picked_up: bookings.filter(b => b.status === 'picked_up').length,
  };

  // ---- This month / week ----
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const monthRevenue = bookings
    .filter(b => b.created_at && b.created_at >= startOfMonth)
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const monthBookings = bookings.filter(b => b.created_at && b.created_at >= startOfMonth).length;

  const weekRevenue = bookings
    .filter(b => b.created_at && b.created_at >= startOfWeek)
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const weekBookings = bookings.filter(b => b.created_at && b.created_at >= startOfWeek).length;

  // ---- Last 30 days chart ----
  const daily: { [key: string]: { revenue: number; bookings: number } } = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    daily[key] = { revenue: 0, bookings: 0 };
  }
  bookings.forEach(b => {
    if (!b.created_at) return;
    const key = b.created_at.split('T')[0];
    if (daily[key]) {
      daily[key].revenue += Number(b.total_price) || 0;
      daily[key].bookings += 1;
    }
  });

  const dailyArray = Object.entries(daily).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    bookings: v.bookings,
  }));

  // ---- Top customers ----
  const customerMap: { [key: string]: { name: string; email: string; bookings: number; revenue: number } } = {};
  bookings.forEach(b => {
    const key = b.customer_email || 'unknown';
    if (!customerMap[key]) {
      customerMap[key] = { name: b.customer_name || 'Unknown', email: key, bookings: 0, revenue: 0 };
    }
    customerMap[key].bookings += 1;
    customerMap[key].revenue += Number(b.total_price) || 0;
  });

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ---- Popular days of week ----
  const dayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  bookings.forEach(b => {
    if (!b.dropoff_date) return;
    const d = new Date(b.dropoff_date);
    if (!isNaN(d.getTime())) dayOfWeek[d.getDay()] += 1;
  });

  return NextResponse.json({
    totals: {
      revenue: totalRevenue,
      bookings: totalBookings,
      bags: totalBags,
    },
    status: statusCounts,
    month: { revenue: monthRevenue, bookings: monthBookings },
    week: { revenue: weekRevenue, bookings: weekBookings },
    daily: dailyArray,
    topCustomers,
    dayOfWeek,
  });
}