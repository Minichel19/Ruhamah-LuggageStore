'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';

export default function Admin() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [role, setRole] = useState<string>('loading');
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bookings')
      .then(r => r.ok ? r.json() : Promise.reject('Unauthorized'))
      .then(setBookings)
      .catch(() => router.push('/admin/login'));

    fetch('/api/settings').then(r => r.json()).then(setSettings);

    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : { role: 'unauthorized' })
      .then(d => setRole(d.role || 'unauthorized'));
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

  async function uploadStorePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch('/api/upload-store-photo', { method: 'POST', body: fd });
    if (res.ok) {
      alert('Store photo uploaded!');
      location.reload();
    } else {
      alert('Upload failed');
    }
  }

  async function removeStorePhoto() {
    if (!confirm('Remove store photo?')) return;
    await fetch('/api/upload-store-photo', { method: 'DELETE' });
    alert('Photo removed');
    location.reload();
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

  async function backupData() {
    if (!confirm('Send backup to your email?')) return;
    const res = await fetch('/api/admin/backup', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      alert(`✓ Backup sent! ${data.bookings} bookings emailed to you.`);
    } else {
      const d = await res.json();
      alert('Backup failed: ' + (d.error || 'Unknown error'));
    }
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
        <div className="overflow-x-auto">
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
                    {b.notes && (
                      <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-1">
                        {b.notes}
                      </div>
                    )}
                    {b.photo_url && (
                      <div className="text-sm text-green-700 bg-green-50 p-1 rounded mt-1 inline-block">
                        &#128247; Photo on file
                      </div>
                    )}
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
                    {b.status === 'picked_up' && (
                      <>
                        <a
                          href={`https://wa.me/${b.customer_phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(
                            `Hi ${b.customer_name}, thank you for choosing Ruhamah LuggageStore! We'd love your feedback: https://lugagestore.com/review?booking=${b.id}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm inline-block"
                        >
                          Send Review
                        </a>
                        <a
                          href={`/review?booking=${b.id}`}
                          target="_blank"
                          className="text-blue-600 underline text-sm ml-2 inline-block"
                        >
                          Review Link
                        </a>
                      </>
                    )}
                    {b.photo_url && (
                      <a href={b.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm inline-block ml-2">
                        View Photo
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed pb-36"
      style={{ backgroundImage: "url('/usa-flag.jpg')" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-red-600 to-blue-900 text-white py-6 px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇺🇸</span>
            <div>
              <h1 className="text-2xl font-bold">Ruhamah LuggageStore</h1>
              <p className="text-sm text-blue-100">Role: {role}</p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-blue-50"
            >
              {showSettings ? '▲ Hide Settings' : '⚙️ Store Settings'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Collapsible Settings */}
        {isOwner && showSettings && (
          <section className="bg-white rounded-lg shadow p-6 mb-8 border-t-4 border-blue-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-900">Store Status & Hours</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

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
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input type="email" placeholder="hello@lugagestore.com"
                  value={settings.contact_email || ''}
                  onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input type="tel" placeholder="(206) 555-1234"
                  value={settings.contact_phone || ''}
                  onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full border p-2 rounded" />
              </div>
            </div>

            {/* Store Photo Upload */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-lg mb-3 text-blue-900">Store Photo</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a photo of your store. It will appear on the homepage.
              </p>

              {settings.store_photo_url ? (
                <div className="mb-3">
                  <img
                    src={settings.store_photo_url}
                    alt="Store"
                    className="rounded-lg max-w-xs shadow-md"
                  />
                  <div className="flex gap-2 mt-3">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-sm inline-block">
                      Replace Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadStorePhoto}
                      />
                    </label>
                    <button
                      onClick={removeStorePhoto}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer inline-block">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadStorePhoto}
                  />
                </label>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4">
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

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={saveSettings} disabled={saving}
                className="bg-blue-900 text-white px-6 py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button onClick={backupData}
                className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700">
                📦 Backup Data to Email
              </button>
            </div>
          </section>
        )}

        {activeTab === 'current' && <BookingTable title="🔵 Current (Today)" items={current} color="bg-blue-800" />}
        {activeTab === 'upcoming' && <BookingTable title="🟢 Upcoming" items={upcoming} color="bg-green-700" />}
        {activeTab === 'past' && <BookingTable title="⚫ Past (Picked Up)" items={past} color="bg-gray-600" />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white shadow-2xl z-40 border-t-4 border-red-600">
        <div className="flex justify-around border-b border-blue-700">
          <button
            onClick={() => { setActiveTab('current'); setShowSettings(false); }}
            className={`flex-1 py-2 text-center transition-colors ${activeTab === 'current' && !showSettings ? 'bg-blue-700 font-bold' : 'hover:bg-blue-800'}`}
          >
            <div className="text-lg">🔵</div>
            <div className="text-xs">Current ({current.length})</div>
          </button>
          <button
            onClick={() => { setActiveTab('upcoming'); setShowSettings(false); }}
            className={`flex-1 py-2 text-center transition-colors ${activeTab === 'upcoming' && !showSettings ? 'bg-green-700 font-bold' : 'hover:bg-blue-800'}`}
          >
            <div className="text-lg">🟢</div>
            <div className="text-xs">Upcoming ({upcoming.length})</div>
          </button>
          <button
            onClick={() => { setActiveTab('past'); setShowSettings(false); }}
            className={`flex-1 py-2 text-center transition-colors ${activeTab === 'past' && !showSettings ? 'bg-gray-700 font-bold' : 'hover:bg-blue-800'}`}
          >
            <div className="text-lg">⚫</div>
            <div className="text-xs">Past ({past.length})</div>
          </button>
          {isOwner && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex-1 py-2 text-center transition-colors ${showSettings ? 'bg-yellow-600 font-bold' : 'hover:bg-blue-800'}`}
            >
              <div className="text-lg">⚙️</div>
              <div className="text-xs">Settings</div>
            </button>
          )}
        </div>

        <div className="flex justify-around items-center py-2 overflow-x-auto">
          <button
            onClick={() => { setShowScanner(true); setScannedBooking(null); }}
            className="flex flex-col items-center px-3 py-2 hover:bg-blue-800 rounded min-w-[64px]"
          >
            <span className="text-xl">📷</span>
            <span className="text-xs mt-1">Scan QR</span>
          </button>
          <a href="/admin/calendar" className="flex flex-col items-center px-3 py-2 hover:bg-blue-800 rounded min-w-[64px]">
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">Calendar</span>
          </a>
          <a href="/admin/analytics" className="flex flex-col items-center px-3 py-2 hover:bg-blue-800 rounded min-w-[64px]">
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Analytics</span>
          </a>
          <a href="/api/export" download className="flex flex-col items-center px-3 py-2 hover:bg-green-700 rounded min-w-[64px]">
            <span className="text-xl">📥</span>
            <span className="text-xs mt-1">Export</span>
          </a>
          {isOwner && (
            <a href="/admin/staff" className="flex flex-col items-center px-3 py-2 hover:bg-blue-800 rounded min-w-[64px]">
              <span className="text-xl">👥</span>
              <span className="text-xs mt-1">Staff</span>
            </a>
          )}
          <button
            onClick={logout}
            className="flex flex-col items-center px-3 py-2 hover:bg-red-700 rounded min-w-[64px]"
          >
            <span className="text-xl">🚪</span>
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </nav>

      {showScanner && !scannedBooking && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={(booking) => setScannedBooking(booking)}
        />
      )}

      {scannedBooking && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-700">&#10003; Booking Found</h2>
              <button
                onClick={() => { setScannedBooking(null); setShowScanner(false); }}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="mb-2"><strong>Customer:</strong> {scannedBooking.customer_name}</p>
              <p className="mb-2"><strong>Email:</strong> {scannedBooking.customer_email}</p>
              <p className="mb-2"><strong>Phone:</strong> {scannedBooking.customer_phone || 'N/A'}</p>
              <p className="mb-2"><strong>Drop-off:</strong> {scannedBooking.dropoff_date}</p>
              <p className="mb-2"><strong>Pick-up:</strong> {scannedBooking.pickup_date}</p>
              <p className="mb-2"><strong>Bags:</strong> {scannedBooking.bag_count}</p>
              <p className="mb-2"><strong>Total:</strong> ${scannedBooking.total_price}</p>
              <p className="mb-2"><strong>Status:</strong> {scannedBooking.status}</p>
              {scannedBooking.notes && (
                <p className="mb-2 text-blue-700 bg-blue-50 p-2 rounded"><strong>Notes:</strong> {scannedBooking.notes}</p>
              )}
              {scannedBooking.photo_url && (
                <img src={scannedBooking.photo_url} alt="Bag photo" className="mt-3 rounded max-w-full" />
              )}
            </div>

            <div className="flex gap-2">
              {scannedBooking.status === 'paid' && (
                <button
                  onClick={async () => {
                    await fetch('/api/bookings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: scannedBooking.id, status: 'stored' }),
                    });
                    alert('Marked as Stored');
                    location.reload();
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700"
                >
                  Mark Stored
                </button>
              )}
              {scannedBooking.status === 'stored' && (
                <button
                  onClick={async () => {
                    await fetch('/api/bookings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: scannedBooking.id, status: 'picked_up' }),
                    });
                    alert('Marked as Picked Up');
                    location.reload();
                  }}
                  className="flex-1 bg-green-700 text-white py-3 rounded font-semibold hover:bg-green-800"
                >
                  Mark Picked Up
                </button>
              )}
              <button
                onClick={() => { setScannedBooking(null); setShowScanner(true); }}
                className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
              >
                Scan Another
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}