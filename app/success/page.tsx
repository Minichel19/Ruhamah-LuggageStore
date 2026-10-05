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
        <h1 className="text-3xl font-bold text-green-600 mb-4">&#10003; Booking Confirmed</h1>
        <p className="text-gray-700 mb-6">Show this QR code when you drop off your bags.</p>

        {booking?.qr_code && (
          <img src={booking.qr_code} alt="QR Code" className="mx-auto w-64 h-64" />
        )}

        <p className="mt-6 text-sm text-gray-500">Booking ID: {booking?.id}</p>

        {/* Bag Photo Section */}
        {booking?.photo_url ? (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-bold mb-3 text-blue-900">Bag Photo (Taken at Drop-off)</h2>
            <img src={booking.photo_url} alt="Your stored bags" className="mx-auto rounded-lg shadow max-w-full" />
            <p className="text-sm text-gray-500 mt-3">
              This is the photo our staff took when receiving your bags.
            </p>
          </div>
        ) : (
          <div className="mt-8 border-t pt-6 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">
              No bag photo yet. Your bags will be photographed when you drop them off.
              Bookmark this page to see the photo later.
            </p>
          </div>
        )}

        {/* Save link notification */}
        <div className="mt-6 text-xs text-gray-400">
          Save this link to check your booking and view your bag photo anytime:
          <br />
          <span className="text-blue-600 break-all">
            https://lugagestore.com/success?session_id={sessionId}
          </span>
        </div>
      </div>
    </main>
  );
}