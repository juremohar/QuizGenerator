import Link from 'next/link';

import { btn } from '@/lib/ui';

interface Props {
  icon?: string;
  children: React.ReactNode;
  action?: { href: string; label: string };
}

/** An empty list should say what is missing and offer the way to fill it. */
export function EmptyState({ icon = 'bi-inbox', children, action }: Props) {
  return (
    <div className="px-4 py-10 text-center">
      <i className={`bi ${icon} block text-3xl text-slate-300`} aria-hidden="true" />
      <p className="mt-3 text-sm text-slate-500">{children}</p>
      {action && (
        <Link className={btn('secondary', 'sm', 'mt-4')} href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
