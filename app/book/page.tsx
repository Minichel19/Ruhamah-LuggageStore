'use client';
import { useState, useEffect } from 'react';

export default function BookPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dropoff: '', pickup: '', bags: 1, notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [pricePerBag, setPricePerBag] = useState(5);  // fallback until settings load

  // Fetch live price from database — cache disabled so admin updates take effect immediately
  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.price_per_bag != null) {
          setPricePerBag(Number(data.price_per_bag));
        }
      })
      .catch(() => {
        // keep fallback of 5 on error
      });
  }, []);

  const days = form.dropoff && form.pickup
    ? Math.max(1, Math.ceil((new Date(form.pickup).getTime() - new Date(form.dropoff).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const total = days * form.bags * pricePerBag;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, total }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('Something went wrong');
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Book Luggage Storage</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" className="w-full border p-3 rounded"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="email" placeholder="Email" className="w-full border p-3 rounded"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input placeholder="Phone" className="w-full border p-3 rounded"
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />

          <label className="block text-sm font-medium">Drop-off Date</label>
          <input required type="date" className="w-full border p-3 rounded"
            value={form.dropoff} onChange={e => setForm({...form, dropoff: e.target.value})} />

          <label className="block text-sm font-medium">Pick-up Date</label>
          <input required type="date" className="w-full border p-3 rounded"
            value={form.pickup} onChange={e => setForm({...form, pickup: e.target.value})} />

          <label className="block text-sm font-medium">Number of Bags</label>
          <input required type="number" min="1" className="w-full border p-3 rounded"
            value={form.bags} onChange={e => setForm({...form, bags: +e.target.value})} />

          <label className="block text-sm font-medium">
            Special Notes (optional)
          </label>
          <textarea
            placeholder="Anything we should know? (fragile items, large bags, questions, etc.)"
            className="w-full border p-3 rounded"
            rows={3}
            value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
          />

          <div className="bg-blue-50 p-4 rounded">
            <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
            <p className="text-sm text-gray-600">{days} day(s) × {form.bags} bag(s) × ${pricePerBag}</p>
          </div>

          <button disabled={loading} type="submit"
            className="w-full bg-blue-900 text-white py-4 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Processing...' : 'Pay & Book'}
          </button>
        </form>
      </div>
    </main>
  );
}