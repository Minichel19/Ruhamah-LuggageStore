import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const session = (await cookies()).get('admin_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('photo') as File;
  const bookingId = formData.get('bookingId') as string;

  if (!file || !bookingId) {
    return NextResponse.json({ error: 'Missing file or booking ID' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${bookingId}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('bag-photos')
    .upload(filename, buffer, { contentType: 'image/jpeg' });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('bag-photos')
    .getPublicUrl(filename);

  await supabaseAdmin
    .from('bookings')
    .update({ photo_url: publicUrl })
    .eq('id', bookingId);

  return NextResponse.json({ url: publicUrl });
}