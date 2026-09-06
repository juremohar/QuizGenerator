'use client';

import { usePathname, useRouter } from 'next/navigation';

export function NovKvizButton() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => {
        // A changed URL guarantees a router-cache miss; refresh() guarantees the server
        // re-renders and reshuffles.
        router.replace(`${pathname}?v=${Date.now()}`);
        router.refresh();
        window.scrollTo({ top: 0 });
      }}
    >
      Nov kviz
    </button>
  );
}
