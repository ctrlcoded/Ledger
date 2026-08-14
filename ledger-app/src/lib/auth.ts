import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  
  // Fall back to harmless placeholders when env is unset so the app still
  // renders in local demo mode (mirrors lib/supabase/client.ts). Auth calls
  // then fail at request time instead of throwing during render/prefetch.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await createClient();

  // Fast path: verify the JWT locally via getClaims() (no network when the
  // project uses asymmetric signing keys). Fall back to the authoritative
  // getUser() only when claims can't be read.
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (data?.claims?.sub) return { userId: data.claims.sub as string };
    if (!error) return null; // no session
  } catch {
    // fall through to getUser
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { userId: user.id };
}
