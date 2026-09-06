'use client';

import { useState } from 'react';

import { arhivirajOpremo } from '@/app/inventar/actions';
import { btn } from '@/lib/ui';
import { SubmitButton } from './SubmitButton';

/**
 * Archiving used to be one tap on a red button sitting right next to "Uredi", with no
 * way back from the list. The inline second step costs one tap and removes the misfire.
 * Deliberately not `window.confirm()`: it is unstyled, easy to dismiss by reflex, and
 * on mobile it covers the row you were looking at.
 */
export function ArchiveButton({ itemId, itemName }: { itemId: number; itemName: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className={btn('dangerSoft', 'sm')}
        onClick={() => setConfirming(true)}
        aria-label={`Arhiviraj ${itemName}`}
      >
        Arhiviraj
      </button>
    );
  }

  return (
    <form action={arhivirajOpremo} className="flex gap-2">
      <input type="hidden" name="itemId" value={itemId} />
      <SubmitButton variant="danger" size="sm" pendingLabel="Arhiviram …">
        Res arhiviraj
      </SubmitButton>
      <button type="button" className={btn('secondary', 'sm')} onClick={() => setConfirming(false)}>
        Ne
      </button>
    </form>
  );
}
