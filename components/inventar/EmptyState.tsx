import Link from 'next/link';

interface Props {
  icon?: string;
  children: React.ReactNode;
  action?: { href: string; label: string };
}

/** An empty list should say what is missing and offer the way to fill it. */
export function EmptyState({ icon = 'bi-inbox', children, action }: Props) {
  return (
    <div className="inv-empty">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <div>{children}</div>
      {action && (
        <Link className="btn btn-sm btn-outline-primary mt-3" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
