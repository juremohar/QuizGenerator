'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireActor } from '@/lib/auth-guard';
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
