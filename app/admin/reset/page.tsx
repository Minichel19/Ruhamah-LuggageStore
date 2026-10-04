'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReset() {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetCode, newPassword }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/login'), 2000);
    } else {
      const data = await res.json();
      setError(data.error || 'Reset failed');
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Password Reset!</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Admin Password</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block text-sm font-medium mb-1">Reset Code</label>
        <input
          type="password"
          placeholder="Enter your reset code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded font-semibold">
          Reset Password
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/admin/login" className="text-blue-600 hover:underline">Back to Login</a>
        </p>
      </form>
    </main>
  );
}