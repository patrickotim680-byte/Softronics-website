/** Shared shape returned by every Server Action, consumed by useActionState. */
export interface ActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
  /** Echoed back so forms can restore what the user typed after a failure. */
  values?: Record<string, string>;
}

export const idleState: ActionState = { status: 'idle' };

export function errorState(message: string, errors?: Record<string, string>): ActionState {
  return { status: 'error', message, errors };
}

export function successState(message: string): ActionState {
  return { status: 'success', message };
}
