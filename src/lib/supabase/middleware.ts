import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, publicEnv } from '@/lib/env';

const LOGIN_PATH = '/admin/login';

/**
 * Refreshes the Supabase session cookie on every request and gates /admin.
 *
 * The middleware is a fast first check only. Every admin page and Server Action
 * independently verifies the user against the admin_users table, and RLS blocks
 * unauthorized writes at the database level.
 */
export async function updateSessionAndGuard(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginRoute = pathname === LOGIN_PATH;

  if (!isSupabaseConfigured()) {
    // Without a database there is nothing to protect; /admin/login renders a
    // setup notice explaining what is missing.
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = '';
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
