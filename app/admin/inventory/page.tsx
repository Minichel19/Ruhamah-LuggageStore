'use client';

import { useEffect, useState, useCallback } from 'react';

type Item = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  cost_price: number | null;
  sale_price: number | null;
  low_stock_at: number | null;
  expiry_date: string | null;
  notes: string | null;
  is_active: boolean;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (categoryFilter) params.set('category', categoryFilter);
    if (lowOnly) params.set('low', '1');
    const res = await fetch(`/api/admin/inventory?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }, [search, categoryFilter, lowOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function adjustQty(id: string, delta: number) {
    await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantityDelta: delta }),
    });
    load();
  }

  async function removeItem(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await fetch(`/api/admin/inventory?id=${item.id}`, { method: 'DELETE' });
    load();
  }

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Store Inventory</h1>
            <p className="text-gray-600 text-sm mt-1">{items.length} items</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin"
              className="bg-white border px-4 py-2 rounded font-medium hover:bg-gray-50"
            >
              ← Dashboard
            </a>
            <button
              onClick={() => setCreating(true)}
              className="bg-blue-900 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">🔍 Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full border p-2 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <label className="md:col-span-3 flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
              className="w-4 h-4"
            />
            ⚠️ Show only low-stock items
          </label>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No items. Click <strong>+ Add Item</strong> to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Cost</th>
                    <th className="p-3 text-left">Sale</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const qty = Number(item.quantity);
                    const low = item.low_stock_at != null && qty <= Number(item.low_stock_at);
                    const out = qty <= 0;
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{item.name}</div>
                          {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                          {item.notes && <div className="text-xs text-gray-500">{item.notes}</div>}
                        </td>
                        <td className="p-3">{item.category || '—'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustQty(item.id, -1)}
                              className="w-7 h-7 border rounded hover:bg-gray-100 text-lg leading-none"
                            >−</button>
                            <span className={`font-mono min-w-[40px] text-center ${out ? 'text-red-600 font-bold' : low ? 'text-orange-600 font-bold' : ''}`}>
                              {qty} {item.unit}
                            </span>
                            <button
                              onClick={() => adjustQty(item.id, 1)}
                              className="w-7 h-7 border rounded hover:bg-gray-100 text-lg leading-none"
                            >+</button>
                            {out && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">OUT</span>}
                            {!out && low && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">LOW</span>}
                          </div>
                        </td>
                        <td className="p-3">{item.cost_price != null ? `$${Number(item.cost_price).toFixed(2)}` : '—'}</td>
                        <td className="p-3">{item.sale_price != null ? `$${Number(item.sale_price).toFixed(2)}` : '—'}</td>
                        <td className="p-3 space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => setEditing(item)}
                            className="text-blue-600 underline text-sm"
                          >Edit</button>
                          <button
                            onClick={() => removeItem(item)}
                            className="text-red-600 underline text-sm"
                          >Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(creating || editing) && (
        <ItemModal
          item={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </main>
  );
}

function ItemModal({
  item,
  onClose,
  onSaved,
}: {
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({
    name: item?.name || '',
    sku: item?.sku || '',
    barcode: item?.barcode || '',
    category: item?.category || '',
    quantity: item?.quantity ?? 0,
    unit: item?.unit || 'each',
    cost_price: item?.cost_price ?? '',
    sale_price: item?.sale_price ?? '',
    low_stock_at: item?.low_stock_at ?? 5,
    expiry_date: item?.expiry_date || '',
    notes: item?.notes || '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    const payload: any = { ...form };
    if (!payload.name) { setErr('Name is required'); setBusy(false); return; }
    if (item) payload.id = item.id;
    const res = await fetch('/api/admin/inventory', {
      method: item ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || 'Save failed'); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{item ? 'Edit item' : 'Add item'}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="produce / dairy / snacks" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border p-2 rounded bg-white">
              <option value="each">each</option>
              <option value="lb">lb</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="case">case</option>
              <option value="bottle">bottle</option>
              <option value="bag">bag</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Low-stock alert at</label>
            <input type="number" value={form.low_stock_at} onChange={(e) => setForm({ ...form, low_stock_at: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost price $</label>
            <input type="number" step="0.01" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale price $</label>
            <input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Expiry date</label>
            <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full border p-2 rounded" />
          </div>
        </div>

        {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={save} disabled={busy}
            className="px-6 py-2 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}