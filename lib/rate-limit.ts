import { supabaseAdmin } from '@/lib/supabase';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

export async function checkRateLimit(
  req: Request,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // Get IP address from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  if (ip === 'unknown') {
    // Can't identify IP — allow but log
    return { allowed: true, remaining: maxRequests };
  }

  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  // Count recent requests
  const { count } = await supabaseAdmin
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart);

  const currentCount = count || 0;

  if (currentCount >= maxRequests) {
    // Find the oldest request in this window to know when to retry
    const { data: oldest } = await supabaseAdmin
      .from('rate_limits')
      .select('created_at')
      .eq('ip', ip)
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    const retryAfterSeconds = oldest
      ? Math.ceil(
          (new Date(oldest.created_at).getTime() + windowSeconds * 1000 - Date.now()) / 1000
        )
      : windowSeconds;

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Log this request
  await supabaseAdmin.from('rate_limits').insert({ ip, endpoint });

  return {
    allowed: true,
    remaining: maxRequests - currentCount - 1,
  };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down.',
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfterSeconds.toString(),
      },
    }
  );
}