'use client';

import { useFormStatus } from 'react-dom';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Shown while the action is in flight. */
  pendingLabel?: string;
}

export function SubmitButton({ children, className = 'btn btn-primary', pendingLabel }: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
