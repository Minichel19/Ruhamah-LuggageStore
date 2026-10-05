'use client';
import { useState, use } from 'react';

export default function ReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-gray-600">Your review has been submitted.</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2 text-center">How was your experience?</h1>
        <p className="text-gray-600 mb-6 text-center">Your feedback helps us serve you better</p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <div className="flex justify-center gap-2 my-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="text-5xl transition-transform hover:scale-110"
                >
                  <span className={s <= (hover || stars) ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="text-sm text-gray-600">{stars} out of 5 stars</p>
            )}
          </div>

          <input
            placeholder="Your Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3 rounded"
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
            className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  );
}