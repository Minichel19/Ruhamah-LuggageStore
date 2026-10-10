import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) return null;
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role, email')
    .eq('token', token)
    .single();
  if (!session || (session.role !== 'owner' && session.role !== 'staff')) return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const lowOnly = searchParams.get('low') === '1';

  let query = supabaseAdmin
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (q) query = query.ilike('name', `%${q}%`);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = lowOnly
    ? (data || []).filter((i) => Number(i.quantity) <= Number(i.low_stock_at ?? 5))
    : data || [];

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const body = await req.json();
  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const insert = {
    name: body.name.trim(),
    sku: body.sku || null,
    barcode: body.barcode || null,
    category: body.category || null,
    quantity: Number(body.quantity ?? 0),
    unit: body.unit || 'each',
    cost_price: body.cost_price != null && body.cost_price !== '' ? Number(body.cost_price) : null,
    sale_price: body.sale_price != null && body.sale_price !== '' ? Number(body.sale_price) : null,
    low_stock_at: body.low_stock_at != null && body.low_stock_at !== '' ? Number(body.low_stock_at) : 5,
    expiry_date: body.expiry_date || null,
    notes: body.notes || null,
    image_url: body.image_url || null,
  };

  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .insert(insert)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction('INVENTORY_CREATED', `Added item "${data.name}" (qty ${data.quantity} ${data.unit})`, req);

  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  if (typeof body.quantityDelta === 'number') {
    const { data: item } = await supabaseAdmin
      .from('inventory_items')
      .select('quantity, name, unit')
      .eq('id', body.id)
      .single();

    if (!item) return NextResponse.json({ error: 'item not found' }, { status: 404 });

    const newQty = Number(item.quantity) + body.quantityDelta;
    const { data, error } = await supabaseAdmin
      .from('inventory_items')
      .update({ quantity: newQty })
      .eq('id', body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAction(
      'INVENTORY_ADJUSTED',
      `${item.name}: ${item.quantity} → ${newQty} ${item.unit} (${body.quantityDelta > 0 ? '+' : ''}${body.quantityDelta})`,
      req
    );

    return NextResponse.json({ item: data });
  }

  const patch: any = {};
  for (const key of ['name', 'sku', 'barcode', 'category', 'unit', 'notes', 'image_url', 'expiry_date']) {
    if (key in body) patch[key] = body[key] || null;
  }
  for (const key of ['quantity', 'cost_price', 'sale_price', 'low_stock_at']) {
    if (key in body) patch[key] = body[key] === null || body[key] === '' ? null : Number(body[key]);
  }

  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .update(patch)
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction('INVENTORY_UPDATED', `Updated item "${data.name}"`, req);

  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('inventory_items')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction('INVENTORY_DELETED', `Removed item "${data.name}"`, req);

  return NextResponse.json({ ok: true });
}