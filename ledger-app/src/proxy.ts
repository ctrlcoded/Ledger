import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes reachable without a session.
const PUBLIC_PREFIXES = ['/login', '/auth'];

// Next 16 renamed the "middleware" convention to "proxy".
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase isn't configured (e.g. local demo), do nothing.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  // Public routes never need an auth round-trip — skip the client entirely.
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify the session. getClaims() validates the JWT LOCALLY when the project
  // uses asymmetric signing keys (no network) and transparently falls back to
  // the auth server otherwise — far cheaper than getUser() on every request.
  let authed = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (data?.claims?.sub) {
      authed = true;
    } else if (error) {
      // getClaims unsupported for this token — do the authoritative check.
      const { data: userData } = await supabase.auth.getUser();
      authed = !!userData.user;
    }
  } catch {
    const { data: userData } = await supabase.auth.getUser();
    authed = !!userData.user;
  }

  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on page navigations only. Skip API routes (they authenticate
  // themselves), Next internals, and static assets — this keeps the auth
  // check off the hot path and eliminates redundant round-trips.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
