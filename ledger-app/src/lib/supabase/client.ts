import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Persists the session in cookies via
 * @supabase/ssr so Server Components and the proxy can read it.
 *
 * Falls back to harmless placeholders when env is unset so the app still
 * renders in local demo mode; auth calls then fail at request time (as they
 * should) instead of throwing during render.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-key'
  );
}
