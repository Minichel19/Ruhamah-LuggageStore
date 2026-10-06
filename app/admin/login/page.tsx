'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      if (data.requires_2fa) {
        setStep('2fa');
      } else {
        router.push('/admin');
      }
    } else {
      const d = await res.json();
      setError(d.error || 'Invalid email or password');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/admin');
    } else {
      const d = await res.json();
      setError(d.error || 'Invalid code');
    }
  }

  if (step === '2fa') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={handleVerify} className="bg-white p-8 rounded-lg shadow-md w-96 max-w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">Check Your Email</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full border p-3 rounded mb-4 text-center text-2xl tracking-widest"
            autoFocus
            required
          />

          <button
            disabled={loading || code.length !== 6}
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('login'); setCode(''); setError(''); }}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to login
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Staff Login</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Continue'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/admin/reset" className="text-blue-600 hover:underline">Forgot Password?</a>
        </p>
      </form>
    </main>
  );
}