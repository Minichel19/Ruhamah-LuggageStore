import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const session = (await cookies()).get('admin_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = session.value.startsWith('owner') ? 'owner' : 'staff';
  return NextResponse.json({ role });
}