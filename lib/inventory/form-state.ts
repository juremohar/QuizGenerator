/**
 * Shared shape for `useActionState`. Kept out of app/inventar/actions.ts because a
 * 'use server' module may only export async functions - exporting a plain object from
 * there is a build error.
 */
export interface FormState {
  ok: boolean;
  errors: string[];
  /** Field-level messages keyed by input name, for inline display. */
  fieldErrors: Record<string, string>;
}

export const EMPTY_FORM_STATE: FormState = { ok: false, errors: [], fieldErrors: {} };
