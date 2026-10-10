'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Log = {
  id: string;
  staff_id: string | null;
  staff_email: string | null;
  action: string;
  details: string | null;
  ip: string | null;
  created_at: string;
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-100 text-green-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  LOGIN_FAILED: 'bg-red-100 text-red-800',
  BOOKING_STATUS: 'bg-blue-100 text-blue-800',
  BAGS_ADDED: 'bg-orange-100 text-orange-800',
  BAGS_REMOVED: 'bg-purple-100 text-purple-800',
  BAGS_CHARGED: 'bg-emerald-100 text-emerald-800',
  BAGS_CHARGE_FAILED: 'bg-red-100 text-red-800',
  SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-800',
  STAFF_CREATED: 'bg-indigo-100 text-indigo-800',
  STAFF_DELETED: 'bg-red-100 text-red-800',
  PASSWORD_RESET: 'bg-pink-100 text-pink-800',
  STORE_PHOTO_ADDED: 'bg-cyan-100 text-cyan-800',
  STORE_PHOTO_REMOVED: 'bg-cyan-100 text-cyan-800',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [search, setSearch] = useState('');

  const [actions, setActions] = useState<string[]>([]);

  async function loadLogs() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (actionFilter) params.set('action', actionFilter);
    if (staffFilter) params.set('staff', staffFilter);
    if (search) params.set('q', search);

    const res = await fetch(`/api/admin/audit?${params.toString()}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);

    // collect distinct actions for filter dropdown (only on first load)
    if (actions.length === 0 && data.logs?.length) {
      const set = new Set<string>();
      data.logs.forEach((l: Log) => set.add(l.action));
      setActions(Array.from(set).sort());
    }
  }

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, staffFilter, search]);

  function fmtTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-gray-600 text-sm mt-1">
              {total.toLocaleString()} total entries
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-blue-900 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option value="">All actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="BOOKING_STATUS">BOOKING_STATUS</option>
              <option value="BAGS_ADDED">BAGS_ADDED</option>
              <option value="BAGS_REMOVED">BAGS_REMOVED</option>
              <option value="BAGS_CHARGED">BAGS_CHARGED</option>
              <option value="BAGS_CHARGE_FAILED">BAGS_CHARGE_FAILED</option>
              <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
              <option value="STAFF_CREATED">STAFF_CREATED</option>
              <option value="STAFF_DELETED">STAFF_DELETED</option>
              <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Staff email contains</label>
            <input
              type="text"
              value={staffFilter}
              onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }}
              placeholder="e.g. minichelgera"
              className="w-full border p-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search in details</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="e.g. Sam, $14, no_show"
              className="w-full border p-2 rounded text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No log entries match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">Time</th>
                    <th className="p-3 text-left">Staff</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {fmtTime(log.created_at)}
                      </td>
                      <td className="p-3">
                        {log.staff_email || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-800">{log.details || '—'}</td>
                      <td className="p-3 text-gray-500 text-xs">{log.ip || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 bg-white border rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}