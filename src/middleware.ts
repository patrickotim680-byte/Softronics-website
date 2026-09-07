import type { NextRequest } from 'next/server';
import { updateSessionAndGuard } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSessionAndGuard(request);
}

export const config = {
  /**
   * Scoped to /admin only.
   *
   * The public website never needs a session, so keeping it out of the matcher
   * avoids an auth round trip on every page view and lets public routes stay
   * statically rendered.
   */
  matcher: ['/admin', '/admin/:path*'],
};
