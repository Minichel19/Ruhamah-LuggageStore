'use client';
import { useEffect, useState, use } from 'react';

export default function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const params = use(searchParams);
  const sessionId = params.session_id;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    const maxAttempts = 10;

    const checkBooking = async () => {
      const res = await fetch(`/api/bookings?session_id=${sessionId}`);
      const data = await res.json();
      if (data.booking) {
        setBooking(data.booking);
        setLoading(false);
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkBooking, 1500);
      } else {
        setLoading(false);
      }
    };
    checkBooking();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-16 px-8">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Confirming your booking...</h1>
          <p className="text-gray-600">Please wait, this may take a few seconds.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✓ Booking Confirmed</h1>
        <p className="text-gray-700 mb-6">Show this QR code when you drop off your bags.</p>
        {booking?.qr_code && <img src={booking.qr_code} alt="QR Code" className="mx-auto w-64 h-64" />}
        <p className="mt-6 text-sm text-gray-500">Booking ID: {booking?.id}</p>
      </div>
    </main>
  );
}