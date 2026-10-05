'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.ok ? r.json() : Promise.reject('Unauthorized'))
      .then(setBookings)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const bookingsByDate: { [key: string]: any[] } = {};
  bookings.forEach(b => {
    if (!b.dropoff_date) return;
    if (!bookingsByDate[b.dropoff_date]) bookingsByDate[b.dropoff_date] = [];
    bookingsByDate[b.dropoff_date].push(b);
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const today = new Date().toISOString().split('T')[0];

  function formatDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const selectedBookings = selectedDay ? bookingsByDate[selectedDay] || [] : [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Bookings Calendar</h1>
          <div className="flex gap-2">
            <a href="/admin" className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800">Dashboard</a>
            <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Today</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">&larr; Prev</button>
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Next &rarr;</button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-bold text-gray-600 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="h-24"></div>;
              const dateStr = formatDate(day);
              const dayBookings = bookingsByDate[dateStr] || [];
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDay;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`h-24 p-2 rounded border text-left transition-all ${
                    isSelected ? 'bg-blue-100 border-blue-600 border-2' :
                    isToday ? 'bg-yellow-50 border-yellow-400 border-2' :
                    'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-sm">{day}</div>
                  {dayBookings.length > 0 && (
                    <div className="mt-1">
                      <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded inline-block">
                        {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDay && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Bookings on {selectedDay}</h3>
            {selectedBookings.length === 0 ? (
              <p className="text-gray-500">No bookings on this day.</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Bags</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Pickup</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBookings.map((b) => (
                    <tr key={b.id} className="border-b">
                      <td className="p-3">
                        {b.customer_name}<br/>
                        <span className="text-sm text-gray-500">{b.customer_email}</span>
                      </td>
                      <td className="p-3">{b.bag_count}</td>
                      <td className="p-3">${b.total_price}</td>
                      <td className="p-3">{b.status}</td>
                      <td className="p-3">{b.pickup_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}