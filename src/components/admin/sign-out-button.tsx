import { signOutAction } from '@/lib/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SubmitButton label="Log out" pendingLabel="Signing out…" variant="secondary" size="sm" />
    </form>
  );
}
