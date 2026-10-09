import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function logAction(
  action: string,
  details: string = '',
  req?: Request
) {
  try {
    const token = (await cookies()).get('admin_session')?.value;

    let staffId: string | null = null;
    let staffEmail = 'unknown';

    if (token) {
      const { data: session } = await supabaseAdmin
        .from('sessions')
        .select('staff_id')
        .eq('token', token)
        .single();

      if (session?.staff_id) {
        staffId = session.staff_id;
        const { data: staff } = await supabaseAdmin
          .from('staff')
          .select('email')
          .eq('id', staffId)
          .single();
        if (staff?.email) staffEmail = staff.email;
      }
    }

    const ip =
      req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const { error } = await supabaseAdmin.from('audit_logs').insert({
      staff_id: staffId,
      staff_email: staffEmail,
      action,
      details,
      ip,
    });

    // TEMPORARY: surface insert errors loudly while debugging
    if (error) {
      console.error('❌ audit_logs insert failed:', error);
      throw new Error(`audit_logs insert failed: ${error.message}`);
    }
  } catch (err) {
    console.error('❌ Failed to log audit:', err);
    throw err; // TEMPORARY — remove this throw once debugging is done
  }
}