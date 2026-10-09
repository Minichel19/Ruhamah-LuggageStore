import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).replace(/^['"]|['"]$/g, '')];
    })
);

console.log('URL present:', !!env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key present:', !!env.SUPABASE_SERVICE_ROLE_KEY);

const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await s
  .from('audit_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);

console.log('error:', error);
console.log('rows:', data);