import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';

export const metadata = {
  title: 'Not authorized',
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Not authorized"
        description="Your account is signed in, but does not have permission for that area."
      />
      <Alert tone="warning" title="Owner role required">
        <p>
          Team and administrator management is restricted to accounts with the{' '}
          <strong>owner</strong> role. Ask an existing owner to grant access, or to perform the
          action for you.
        </p>
      </Alert>
      <Link
        href="/admin"
        className="inline-block text-sm font-medium text-brand-strong underline decoration-brand/30 underline-offset-4"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
