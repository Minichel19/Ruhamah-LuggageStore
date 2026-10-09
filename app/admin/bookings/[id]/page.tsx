'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  dropoff_date: string;
  pickup_date: string;
  bag_count: number;
  bags_actual: number | null;
  price_per_bag: number | null;
  total_price: number;
  amount_charged_extra: number;
  amount_refunded: number;
  status: string;
  notes: string | null;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
};

const DEFAULT_PRICE_PER_BAG = 8;

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [actual, setActual] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    const res = await fetch(`/api/bookings?id=${id}`);
    const data = await res.json();
    const b = data.booking || (Array.isArray(data) ? data[0] : data);
    if (b) {
      setBooking(b);
      setActual((prev) => (prev === 0 ? b.bags_actual ?? b.bag_count : prev));
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadBooking();
    const interval = setInterval(loadBooking, 5000);
    return () => clearInterval(interval);
  }, [id, loadBooking]);

  if (!booking) return <div className="p-8">Loading…</div>;

  const booked = booking.bag_count;
  const delta = actual - booked;
  const perBag = Number(booking.price_per_bag) || DEFAULT_PRICE_PER_BAG;
  const amountDue = delta * perBag;
  const hasCardOnFile = !!(booking.stripe_customer_id && booking.stripe_payment_method_id);
  const extraCharged = Number(booking.amount_charged_extra || 0);
  const refunded = Number(booking.amount_refunded || 0);
  const paid = extraCharged > 0 || refunded > 0;

  async function sendPaymentLink() {
    setBusy(true);
    setMessage(null);
    setLink(null);

    const res = await fetch(`/api/admin/bookings/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bags_actual: actual }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) return setMessage(`❌ ${data.error}`);
    if (data.type === 'payment_link') {
      setMessage(`✅ Payment link sent · $${data.amount_due.toFixed(2)}`);
      setLink(data.url);
    } else if (data.type === 'refund') {
      setMessage(`✅ Refunded $${data.amount_refunded.toFixed(2)}`);
    } else if (data.changed === false) {
      setMessage('No change');
    } else {
      setMessage('✅ Saved');
    }
    loadBooking();
  }

  async function chargeCard() {
    setBusy(true);
    setMessage(null);
    setLink(null);

    await fetch(`/api/admin/bookings/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bags_actual: actual, skip_charge: true }),
    });

    const res = await fetch(`/api/admin/bookings/${id}/charge-card`, { method: 'POST' });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) return setMessage(`❌ ${data.error}`);
    setMessage(`✅ Charged $${data.amount_charged.toFixed(2)} · ${data.payment_intent}`);
    loadBooking();
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Booking · {booking.id.slice(0, 8)}</h1>

      {paid && (
        <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
          <strong className="text-green-800">✅ PAID</strong>
          <span className="ml-2 text-green-800">
            Extra charged: ${extraCharged.toFixed(2)}
            {refunded > 0 && ` · Refunded: $${refunded.toFixed(2)}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
        <div><strong>Customer:</strong> {booking.customer_name}</div>
        <div><strong>Email:</strong> {booking.customer_email}</div>
        <div><strong>Phone:</strong> {booking.customer_phone}</div>
        <div><strong>Status:</strong> {booking.status}</div>
        <div><strong>Drop-off:</strong> {booking.dropoff_date}</div>
        <div><strong>Pickup:</strong> {booking.pickup_date}</div>
        <div><strong>Booked bags:</strong> {booked}</div>
        <div>
          <strong>Price per bag:</strong> ${perBag.toFixed(2)}
          {booking.price_per_bag == null && (
            <span className="text-xs text-orange-600 ml-2">(default)</span>
          )}
        </div>
        <div><strong>Originally paid:</strong> ${Number(booking.total_price).toFixed(2)}</div>
        <div><strong>Extra charged:</strong> ${extraCharged.toFixed(2)}</div>
        <div><strong>Refunded:</strong> ${refunded.toFixed(2)}</div>
        <div>
          <strong>Card on file:</strong>{' '}
          {hasCardOnFile ? '✅ Yes' : '❌ No'}
        </div>
      </div>

      <div className="border rounded p-4 space-y-4">
        <h2 className="font-semibold text-lg">Adjust bags on arrival</h2>

        <div className="flex items-center gap-4">
          <button onClick={() => setActual((n) => Math.max(0, n - 1))} className="px-4 py-2 border rounded text-lg">−</button>
          <span className="text-2xl font-mono">{actual}</span>
          <button onClick={() => setActual((n) => n + 1)} className="px-4 py-2 border rounded text-lg">+</button>
          <span className="text-gray-500">(booked: {booked})</span>
        </div>

        {delta !== 0 && (
          <div className={`text-lg ${delta > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {delta > 0
              ? `Customer owes: $${amountDue.toFixed(2)} (${delta} extra × $${perBag.toFixed(2)})`
              : `Refund due: $${Math.abs(amountDue).toFixed(2)} (${Math.abs(delta)} fewer)`}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {delta > 0 && hasCardOnFile && (
            <button
              onClick={chargeCard}
              disabled={busy}
              className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {busy ? 'Working…' : `Charge card $${amountDue.toFixed(2)}`}
            </button>
          )}

          {delta > 0 && (
            <button
              onClick={sendPaymentLink}
              disabled={busy}
              className={`px-6 py-2 rounded disabled:opacity-50 ${
                hasCardOnFile
                  ? 'border border-gray-400 text-gray-700'
                  : 'bg-black text-white'
              }`}
            >
              {busy ? 'Working…' : `Send payment link $${amountDue.toFixed(2)}`}
            </button>
          )}

          {delta < 0 && (
            <button
              onClick={sendPaymentLink}
              disabled={busy}
              className="px-6 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              {busy ? 'Working…' : `Refund $${Math.abs(amountDue).toFixed(2)}`}
            </button>
          )}

          {delta === 0 && (
            <button disabled className="px-6 py-2 bg-gray-300 text-white rounded">
              No change
            </button>
          )}
        </div>

        {message && <div className="text-sm">{message}</div>}
        {link && (
          <div className="text-xs break-all bg-gray-100 p-2 rounded">
            <strong>Payment link (also emailed):</strong><br />
            <a href={link} target="_blank" className="text-blue-600 underline">{link}</a>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Auto-refreshing every 5 seconds. Page will update when payment lands.
        </p>
      </div>
    </div>
  );
}