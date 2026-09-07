import { ConfirmSubmit } from '@/components/ui/confirm-submit';
import { SubmitButton } from '@/components/ui/submit-button';

/**
 * Inline list actions. Each control is its own <form> bound to a Server Action,
 * so it works without client-side JavaScript and cannot fire by accident.
 */
export function StatusAction({
  action,
  id,
  status,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  status: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton label={label} pendingLabel="…" variant="secondary" size="sm" />
    </form>
  );
}

export function ToggleAction({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} pendingLabel="…" variant="secondary" size="sm" />
    </form>
  );
}

export function DeleteAction({
  action,
  id,
  confirmMessage,
  label = 'Delete',
  field = 'id',
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage: string;
  label?: string;
  field?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={field} value={id} />
      <ConfirmSubmit label={label} confirmMessage={confirmMessage} />
    </form>
  );
}
