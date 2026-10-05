  // Rate limit: block after 10 failed attempts in 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count: failedAttempts } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .eq('success', false)
    .gte('created_at', fiveMinAgo);

  if ((failedAttempts || 0) >= 10) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 5 minutes.' },
      { status: 429 }
    );
  }