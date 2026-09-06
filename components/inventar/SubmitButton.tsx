'use client';

import { useFormStatus } from 'react-dom';

import { btn, type ButtonSize, type ButtonVariant } from '@/lib/ui';

interface Props {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Shown while the action is in flight. */
  pendingLabel?: string;
}

export function SubmitButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  pendingLabel,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={btn(variant, size, className)} disabled={pending}>
      {pending && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
