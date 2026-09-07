import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { countUnreadMessages } from '@/lib/db/messages';
import { AdminSidebar } from '@/components/admin/sidebar';
import { SignOutButton } from '@/components/admin/sign-out-button';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | Softronics CMS' },
  robots: { index: false, follow: false },
};

/**
 * Every page under this layout is protected twice: middleware redirects
 * unauthenticated requests, and requireAdmin re-verifies the session against the
 * database on each render. Server Actions check again independently.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();
  const unread = await countUnreadMessages();

  return (
    <AdminSidebar unreadCount={unread} canManageTeam={session.admin.role === 'owner'}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-canvas/95 px-5 backdrop-blur-[2px] lg:h-16 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {session.admin.full_name ?? session.email}
            </p>
            <p className="truncate font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
              {session.admin.role}
            </p>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 px-5 py-7 lg:px-8 lg:py-9">{children}</main>
      </div>
    </AdminSidebar>
  );
}
