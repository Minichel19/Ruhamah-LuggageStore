'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.ok ? r.json() : Promise.reject('Unauthorized'))
      .then(setData)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  if (!data) return <main className="min-h-screen bg-gray-50 p-8">Loading...</main>;

  const maxRevenue = Math.max(...data.daily.map((d: any) => d.revenue), 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxDayCount = Math.max(...data.dayOfWeek, 1);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <a href="/admin" className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800">
            Back to Dashboard
          </a>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-900">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-900">${data.totals.revenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
            <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-green-700">{data.totals.bookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
            <p className="text-sm text-gray-500 mb-1">Total Bags Stored</p>
            <p className="text-3xl font-bold text-purple-700">{data.totals.bags}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
            <p className="text-sm text-gray-500 mb-1">In Storage Now</p>
            <p className="text-3xl font-bold text-yellow-600">
              {data.status.paid + data.status.stored}
            </p>
          </div>
        </div>

        {/* This Month / Week */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-blue-900">This Month</h2>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">${data.month.revenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bookings</p>
                <p className="text-2xl font-bold">{data.month.bookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-green-700">Last 7 Days</h2>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">${data.week.revenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bookings</p>
                <p className="text-2xl font-bold">{data.week.bookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Booking Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Paid (awaiting drop-off)</p>
              <p className="text-2xl font-bold text-blue-700">{data.status.paid}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Currently Stored</p>
              <p className="text-2xl font-bold text-green-700">{data.status.stored}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Picked Up</p>
              <p className="text-2xl font-bold text-gray-700">{data.status.picked_up}</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart - Last 30 Days */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Revenue (Last 30 Days)</h2>
          <div className="flex items-end gap-1 h-40">
            {data.daily.map((d: any) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div
                  className="bg-blue-600 hover:bg-blue-800 w-full rounded-t transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '1px' }}
                  title={`${d.date}: $${d.revenue.toFixed(2)} (${d.bookings} bookings)`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Popular Days */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Popular Drop-off Days</h2>
          <div className="grid grid-cols-7 gap-2">
            {data.dayOfWeek.map((count: number, idx: number) => (
              <div key={idx} className="text-center">
                <div
                  className="bg-purple-600 rounded-t mx-auto"
                  style={{ height: `${(count / maxDayCount) * 100}px`, minHeight: count > 0 ? '8px' : '2px', width: '100%' }}
                ></div>
                <p className="text-xs mt-2 font-medium">{dayNames[idx]}</p>
                <p className="text-sm font-bold text-purple-700">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Top Customers</h2>
          {data.topCustomers.length === 0 ? (
            <p className="text-gray-500">No customers yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Bookings</th>
                  <th className="p-3 text-left">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c: any) => (
                  <tr key={c.email} className="border-b">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-gray-600">{c.email}</td>
                    <td className="p-3">{c.bookings}</td>
                    <td className="p-3 font-bold text-green-700">${c.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}