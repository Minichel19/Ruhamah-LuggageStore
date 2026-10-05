'use client';
import { useEffect, useState } from 'react';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || []);
        setAverage(d.average || 0);
        setTotal(d.total || 0);
      });
  }, []);

  if (total === 0) {
    return (
      <p className="text-center text-gray-500">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-yellow-500">
          {average.toFixed(1)} ?
        </div>
        <p className="text-gray-600 mt-2">Based on {total} review{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.slice(0, 6).map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-lg shadow">
            <div className="text-yellow-400 text-lg mb-1">
              {'?'.repeat(r.stars)}{'?'.repeat(5 - r.stars)}
            </div>
            {r.comment && (
              <p className="text-gray-700 mb-2 italic">&ldquo;{r.comment}&rdquo;</p>
            )}
            <p className="text-sm text-gray-500">— {r.customer_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
