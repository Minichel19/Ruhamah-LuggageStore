import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session || session.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can upload store photos' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('photo') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `store-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('store-photos')
    .upload(filename, buffer, { contentType: file.type || 'image/jpeg' });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('store-photos')
    .getPublicUrl(filename);

  await supabaseAdmin
    .from('settings')
    .update({ store_photo_url: publicUrl })
    .eq('id', 1);

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE() {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('role')
    .eq('token', token)
    .single();

  if (!session || session.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can delete' }, { status: 403 });
  }

  await supabaseAdmin
    .from('settings')
    .update({ store_photo_url: null })
    .eq('id', 1);

  return NextResponse.json({ success: true });
}