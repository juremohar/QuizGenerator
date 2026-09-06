/**
 * Chasing a late return means calling someone, and this app is mostly used on a phone,
 * so the number is always a one-tap `tel:` link with the spaces stripped from the href.
 */
export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  return (
    <a className={`text-nowrap ${className ?? ''}`} href={`tel:${phone.replace(/\s/g, '')}`}>
      <i className="bi bi-telephone me-1" aria-hidden="true" />
      {phone}
    </a>
  );
}
