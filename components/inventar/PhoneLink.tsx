import { cx } from '@/lib/ui';

/**
 * Chasing a late return means calling someone, and this app is mostly used on a phone,
 * so the number is always a one-tap `tel:` link with the spaces stripped from the href.
 */
export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-blue-700 underline-offset-2 hover:underline',
        className,
      )}
    >
      <i className="bi bi-telephone" aria-hidden="true" />
      {phone}
    </a>
  );
}
