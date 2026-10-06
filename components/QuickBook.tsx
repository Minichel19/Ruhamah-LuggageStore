'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickBook({ pricePerBag }: { pricePerBag: number }) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [dropoff, setDropoff] = useState(today);
  const [pickup, setPickup] = useState(tomorrow);
  const [bags, setBags] = useState(1);

  const days = dropoff && pickup
    ? Math.max(1, Math.ceil(
        (new Date(pickup).getTime() - new Date(dropoff).getTime()) / (1000 * 60 * 60 * 24)
      ))
    : 1;

  const total = days * bags * pricePerBag;

  function handleBook() {
    // Pass values to the booking page via URL
    const params = new URLSearchParams({
      dropoff,
      pickup,
      bags: bags.toString(),
    });
    router.push(`/book?${params.toString()}`);
  }

  return (
    <section className="bg-white py-8 px-4 md:px-8 border-b shadow-md">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-center text-lg font-bold text-blue-900 mb-4">
          📅 Quick Booking — Check Availability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Drop-off Date</label>
            <input
              type="date"
              value={dropoff}
              min={today}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full border p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pick-up Date</label>
            <input
              type="date"
              value={pickup}
              min={dropoff || today}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full border p-3 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bags</label>
            <input
              type="number"
              min="1"
              max="20"
              value={bags}
              onChange={(e) => setBags(+e.target.value)}
              className="w-full border p-3 rounded"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleBook}
              className="w-full bg-blue-900 text-white py-3 px-6 rounded font-semibold hover:bg-blue-800"
            >
              Book for ${total}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-3">
          {days} day{days !== 1 ? 's' : ''} × {bags} bag{bags !== 1 ? 's' : ''} × ${pricePerBag}/bag/day
        </p>
      </div>
    </section>
  );
}