import Link from 'next/link';

interface Props {
  title: React.ReactNode;
  /** One short sentence under the title, when the page needs explaining. */
  lead?: React.ReactNode;
  /** Where "up" is, shown above the title on phones where there is no visible nav trail. */
  back?: { href: string; label: string };
  /** Primary action, rendered full width on phones so it is a comfortable thumb target. */
  action?: { href: string; label: string; icon?: string };
  children?: React.ReactNode;
}

export function PageHeader({ title, lead, back, action, children }: Props) {
  return (
    <div className="mb-4">
      {back && (
        <Link className="link-secondary small d-inline-block mb-2" href={back.href}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          {back.label}
        </Link>
      )}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div className="flex-grow-1">
          <h1 className="fs-3 mb-0">{title}</h1>
          {lead && <p className="text-secondary mb-0 mt-1">{lead}</p>}
        </div>

        {action && (
          <Link className="btn btn-primary w-100 w-sm-auto flex-sm-shrink-0" href={action.href}>
            {action.icon && <i className={`bi ${action.icon} me-2`} aria-hidden="true" />}
            {action.label}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
