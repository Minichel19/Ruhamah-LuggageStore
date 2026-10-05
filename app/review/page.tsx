'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReviewForm() {
  const params = useSearchParams();
  const bookingId = params.get('booking') || '';
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stars === 0) {
      setError('Please select a star rating');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, stars, comment, name }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
    else {
      const d = await res.json();
      setError(d.error || 'Failed to submit review');
    }
  }

  if (sent) {
    return (
      <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
        <div className="text-6xl mb-4 text-yellow-500">&#9733;</div>
        <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-600">Your review has been submitted.</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow max-w-lg w-full">
      <h1 className="text-2xl font-bold mb-2 text-center">How was your experience?</h1>
      <p className="text-gray-600 mb-6 text-center">Your feedback helps us serve you better</p>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => setStars(s)} className="text-5xl">
              <span className={s <= stars ? 'text-yellow-400' : 'text-gray-300'}>
                {s <= stars ? '\u2605' : '\u2606'}
              </span>
            </button>
          ))}
        </div>
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />
        <textarea
          placeholder="Tell us about your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full border p-3 rounded"
        />
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ReviewForm />
      </Suspense>
    </main>
  );
}