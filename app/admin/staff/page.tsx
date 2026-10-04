'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const router = useRouter();

  async function loadStaff() {
    const res = await fetch('/api/admin/staff');
    if (res.ok) setStaff(await res.json());
    else router.push('/admin/login');
  }

  useEffect(() => { loadStaff(); }, []);

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (res.ok) {
      setName(''); setEmail(''); setPassword(''); setRole('staff');
      loadStaff();
    } else {
      const d = await res.json();
      setError(d.error || 'Failed to add staff');
    }
  }

  async function removeStaff(id: string) {
    if (!confirm('Remove this staff member?')) return;
    await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
    loadStaff();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Staff Management</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={addStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
              className="border p-3 rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="border p-3 rounded" required />
            <input type="text" placeholder="Temporary Password" value={password} onChange={e => setPassword(e.target.value)}
              className="border p-3 rounded" required />
            <select value={role} onChange={e => setRole(e.target.value)} className="border p-3 rounded">
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-blue-900 text-white py-3 rounded font-semibold">
              Add Staff Member
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b">Current Staff</h2>
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.role}</td>
                  <td className="p-3">
                    <button onClick={() => removeStaff(s.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    </main>
  );
}