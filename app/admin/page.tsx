'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.ok ? r.json() : Promise.reject('Unauthorized'))
      .then(setBookings)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    location.reload();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Drop-off</th>
              <th className="p-3 text-left">Pick-up</th>
              <th className="p-3 text-left">Bags</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">{b.customer_name}<br/><span className="text-sm text-gray-500">{b.customer_email}</span></td>
                <td className="p-3">{b.dropoff_date}</td>
                <td className="p-3">{b.pickup_date}</td>
                <td className="p-3">{b.bag_count}</td>
                <td className="p-3">${b.total_price}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">
                  {b.status === 'paid' && <button onClick={() => updateStatus(b.id, 'stored')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Mark Stored</button>}
                  {b.status === 'stored' && <button onClick={() => updateStatus(b.id, 'picked_up')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Mark Picked Up</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}