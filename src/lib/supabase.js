import { createClient } from '@supabase/supabase-js';

// Falls back to the project's published credentials so the deployed build
// works out of the box; override via Vite env vars when self-hosting.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://vcapspxecmcvxmubpwhi.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jNS4KXSxES0SKnT9SJ9ouQ_TzmMSqPi';

export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 5 } },
});
