'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [role, setRole] = useState<string>('staff');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.ok ? r.json() : Promise.reject('Unauthorized'))
      .then(setBookings)
      .catch(() => router.push('/admin/login'));

    fetch('/api/settings').then(r => r.json()).then(setSettings);

    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : { role: 'staff' })
      .then(d => setRole(d.role || 'staff'));
  }, [router]);

  async function updateStatus(id: string, status: string) {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    location.reload();
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>, bookingId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('bookingId', bookingId);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      alert('Photo uploaded!');
      location.reload();
    } else {
      alert('Upload failed');
    }
  }

  async function saveSettings() {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    alert('Settings saved!');
    location.reload();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  if (!settings) return <main className="p-8">Loading...</main>;

  const isOwner = role === 'owner';
  const today = new Date().toISOString().split('T')[0];

  const upcoming = bookings.filter(b => b.dropoff_date > today && b.status !== 'picked_up');
  const current = bookings.filter(b => b.dropoff_date <= today && b.status !== 'picked_up');
  const past = bookings.filter(b => b.status === 'picked_up');

  const BookingTable = ({ title, items, color }: { title: string; items: any[]; color: string }) => (
    <section className="bg-white rounded-lg shadow overflow-hidden mb-8 border-t-4 border-blue-900">
      <div className={`${color} px-6 py-4`}>
        <h2 className="text-xl font-bold text-white">{title} ({items.length})</h2>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No bookings</div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-100">
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
            {items.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">
                  {b.customer_name}<br/>
                  <span className="text-sm text-gray-500">{b.customer_email}</span>
                </td>
                <td className="p-3">{b.dropoff_date}</td>
                <td className="p-3">{b.pickup_date}</td>
                <td className="p-3">{b.bag_count}</td>
                <td className="p-3">${b.total_price}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3 space-x-1">
                  {b.status === 'paid' && (
                    <>
                      <label className="bg-purple-600 text-white px-3 py-1 rounded text-sm cursor-pointer inline-block">
                        Take Photo
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                          onChange={(e) => uploadPhoto(e, b.id)} />
                      </label>
                      <button onClick={() => updateStatus(b.id, 'stored')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Mark Stored
                      </button>
                    </>
                  )}
                  {b.status === 'stored' && (
                    <button onClick={() => updateStatus(b.id, 'picked_up')}
                      className="bg-green-700 text-white px-3 py-1 rounded text-sm">
                      Mark Picked Up
                    </button>
                  )}
                  {b.photo_url && (
                    <a href={b.photo_url} target="_blank" className="text-blue-600 underline text-sm inline-block">
                      View Photo
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with USA flag theme */}
      <div className="bg-gradient-to-r from-blue-900 via-red-600 to-blue-900 text-white py-6 px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇺🇸</span>
            <div>
              <h1 className="text-2xl font-bold">Ruhamah LuggageStore</h1>
              <p className="text-sm text-blue-100">Staff Dashboard</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isOwner && (
              <a href="/admin/staff" className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-blue-50">
                Manage Staff →
              </a>
            )}
            <button onClick={logout} className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 border border-white">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {isOwner && (
          <section className="bg-white rounded-lg shadow p-6 mb-8 border-t-4 border-blue-900">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Store Status & Hours</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Opening Time</label>
                <input type="time" value={settings.opening_time}
                  onChange={e => setSettings({ ...settings, opening_time: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Closing Time</label>
                <input type="time" value={settings.closing_time}
                  onChange={e => setSettings({ ...settings, closing_time: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price per Bag (per day)</label>
                <input type="number" step="0.01" value={settings.price_per_bag}
                  onChange={e => setSettings({ ...settings, price_per_bag: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Special Hours Note</label>
                <input type="text" placeholder="e.g., Closed Dec 25 for Christmas"
                  value={settings.special_hours || ''}
                  onChange={e => setSettings({ ...settings, special_hours: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.is_closed || false}
                  onChange={e => setSettings({ ...settings, is_closed: e.target.checked })}
                  className="w-5 h-5" />
                <span className="font-medium">Mark store as CLOSED</span>
              </label>
              {settings.is_closed && (
                <input type="text" placeholder="Reason shown to customers"
                  value={settings.closed_message || ''}
                  onChange={e => setSettings({ ...settings, closed_message: e.target.value })}
                  className="flex-1 border p-2 rounded" />
              )}
            </div>

            <button onClick={saveSettings} disabled={saving}
              className="mt-6 bg-blue-900 text-white px-6 py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </section>
        )}

        <BookingTable title="🔵 Current (Today)" items={current} color="bg-blue-800" />
        <BookingTable title="🟢 Upcoming" items={upcoming} color="bg-green-700" />
        <BookingTable title="⚫ Past (Picked Up)" items={past} color="bg-gray-600" />
      </div>
    </main>
  );
}