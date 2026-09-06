import Link from 'next/link';

import { btn } from '@/lib/ui';

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
    <div className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
          {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {lead && <p className="mt-1 text-sm text-slate-500">{lead}</p>}
        </div>

        {action && (
          <Link className={btn('primary', 'md', 'max-sm:w-full')} href={action.href}>
            {action.icon && <i className={`bi ${action.icon}`} aria-hidden="true" />}
            {action.label}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
