'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireActor } from '@/lib/auth-guard';
import { getDb } from '@/db/client';
import { isIsoDate } from '@/lib/dates';
import { computeAvailability } from '@/lib/inventory/availability';
import { fetchItems, fetchOverlappingUsage } from '@/lib/inventory/queries';
import {
  archiveItem,
  cancelLoan,
  createLoan,
  markHandedOver,
  markReturned,
  saveItem,
  updateLoan,
} from '@/lib/inventory/mutations';
import { describeProblems } from '@/lib/inventory/messages';
import {
  itemInputSchema,
  loanInputSchema,
  parseItemLines,
  returnInputSchema,
} from '@/lib/inventory/validation';
import type { FormState } from '@/lib/inventory/form-state';

/** Zod v4 issue paths are PropertyKey[], so segments are stringified defensively. */
function zodToState(error: {
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[];
}): FormState {
  const fieldErrors: Record<string, string> = {};
  const errors: string[] = [];

  for (const issue of error.issues) {
    const key = issue.path.map((segment) => String(segment)).join('.');
    if (key) fieldErrors[key] ??= issue.message;
    else errors.push(issue.message);
  }
  return { ok: false, errors, fieldErrors };
}

function loanFormValues(formData: FormData) {
  return {
    borrowerName: String(formData.get('borrowerName') ?? ''),
    borrowerPhone: String(formData.get('borrowerPhone') ?? ''),
    purpose: String(formData.get('purpose') ?? ''),
    fromDate: String(formData.get('fromDate') ?? ''),
    toDate: String(formData.get('toDate') ?? ''),
    items: parseItemLines(formData),
  };
}

export async function ustvariIzposojo(_prev: FormState, formData: FormData): Promise<FormState> {
  // Authorization. Server Actions are addressable POST endpoints, so this must be here
  // regardless of the proxy and layout checks.
  const actor = await requireActor();

  const parsed = loanInputSchema.safeParse(loanFormValues(formData));
  if (!parsed.success) return zodToState(parsed.error);

  const result = await createLoan(parsed.data, actor);
  if (!result.ok) {
    return {
      ok: false,
      errors: result.problems
        ? describeProblems(result.problems)
        : [result.message ?? 'Shranjevanje ni uspelo.'],
      fieldErrors: {},
    };
  }

  revalidatePath('/inventar');
  revalidatePath('/inventar/izposoje');
  redirect(`/inventar/izposoje/${result.id}`);
}

export async function urediIzposojo(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireActor();

  const id = Number(formData.get('loanId'));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, errors: ['Neveljavna izposoja.'], fieldErrors: {} };
  }

  const parsed = loanInputSchema.safeParse(loanFormValues(formData));
  if (!parsed.success) return zodToState(parsed.error);

  const result = await updateLoan(id, parsed.data, actor);
  if (!result.ok) {
    return {
      ok: false,
      errors: result.problems
        ? describeProblems(result.problems)
        : [result.message ?? 'Shranjevanje ni uspelo.'],
      fieldErrors: {},
    };
  }

  revalidatePath('/inventar');
  revalidatePath('/inventar/izposoje');
  redirect(`/inventar/izposoje/${id}`);
}

export async function oznaciPredano(formData: FormData): Promise<void> {
  const actor = await requireActor();
  const id = Number(formData.get('loanId'));
  if (Number.isInteger(id) && id > 0) await markHandedOver(id, actor);

  revalidatePath('/inventar');
  revalidatePath(`/inventar/izposoje/${id}`);
}

export async function oznaciVrnjeno(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireActor();

  const parsed = returnInputSchema.safeParse({
    loanId: formData.get('loanId'),
    returnConditionNote: formData.get('returnConditionNote') ?? '',
    extendToToday: formData.get('extendToToday') === 'on',
  });
  if (!parsed.success) return zodToState(parsed.error);

  const result = await markReturned(parsed.data.loanId, actor, {
    conditionNote: parsed.data.returnConditionNote,
    extendToToday: parsed.data.extendToToday,
  });

  if (!result.ok) {
    return {
      ok: false,
      errors: [result.message ?? 'Vrnitve ni bilo mogoče zabeležiti.'],
      fieldErrors: {},
    };
  }

  revalidatePath('/inventar');
  revalidatePath(`/inventar/izposoje/${parsed.data.loanId}`);
  return { ok: true, errors: [], fieldErrors: {} };
}

export async function preklici(formData: FormData): Promise<void> {
  const actor = await requireActor();
  const id = Number(formData.get('loanId'));
  const reason = String(formData.get('cancelReason') ?? '');
  if (Number.isInteger(id) && id > 0) await cancelLoan(id, actor, reason);

  revalidatePath('/inventar');
  revalidatePath(`/inventar/izposoje/${id}`);
}

export async function shraniOpremo(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireActor();

  const rawId = formData.get('itemId');
  const parsedId = rawId ? Number(rawId) : undefined;
  const id = Number.isInteger(parsedId) && (parsedId as number) > 0 ? parsedId : undefined;

  const parsed = itemInputSchema.safeParse({
    name: formData.get('name') ?? '',
    totalQuantity: formData.get('totalQuantity') ?? '',
    active: formData.get('active') === 'on',
    sortOrder: formData.get('sortOrder') ?? 0,
    notes: formData.get('notes') ?? '',
  });
  if (!parsed.success) return zodToState(parsed.error);

  const result = await saveItem(parsed.data, { id, force: formData.get('force') === 'on' });
  if (!result.ok) {
    return { ok: false, errors: [result.message ?? 'Shranjevanje ni uspelo.'], fieldErrors: {} };
  }

  revalidatePath('/inventar/oprema');
  revalidatePath('/inventar');
  redirect('/inventar/oprema');
}

export async function arhivirajOpremo(formData: FormData): Promise<void> {
  await requireActor();
  const id = Number(formData.get('itemId'));
  if (Number.isInteger(id) && id > 0) await archiveItem(id);

  revalidatePath('/inventar/oprema');
}

export async function odjava(): Promise<void> {
  const { signOut } = await import('@/auth');
  await signOut({ redirectTo: '/' });
}

export interface RazpolozljivostKosov {
  itemId: number;
  available: number;
  total: number;
}

/**
 * How many of each item are free for a period, so the loan form can cap its quantity
 * inputs at what can actually be promised instead of at total stock.
 *
 * This is a CONVENIENCE, not the guarantee. The binding check still happens inside the
 * write transaction in createLoan/updateLoan, under the advisory lock - two people can
 * hold this answer at the same moment and only one of them can win.
 *
 * `excludeLoanId` is what makes editing work: loan #7's own rows must not count against
 * loan #7, or you could never widen an existing booking.
 *
 * requireActor() first, like every action here: a Server Action is an addressable POST
 * endpoint, so this would otherwise leak the brigade's booking levels to anyone.
 */
export async function razpolozljivostZaObdobje(
  od: string,
  doDate: string,
  loanId?: number,
): Promise<RazpolozljivostKosov[]> {
  await requireActor();

  if (!isIsoDate(od) || !isIsoDate(doDate) || od > doDate) return [];

  const db = getDb();
  // Every item, not just active ones: editing an old loan can reference archived kit.
  const oprema = await fetchItems(db);
  const usage = await fetchOverlappingUsage(db, od, doDate, { excludeLoanId: loanId });

  return computeAvailability(oprema, usage, od, doDate).map((r) => ({
    itemId: r.itemId,
    available: r.available,
    total: r.total,
  }));
}
