/**
 * Slovenian count agreement.
 *
 * Slovenian has four forms selected by n mod 100: singular (1), dual (2), few (3-4) and
 * the genitive plural (everything else). The inventory UI prints counts constantly
 * ("zamuja 2 dni", "5 kos"), and every one of those was wrong before this existed.
 *
 * 101 -> 1 -> singular, 111 -> 11 -> plural, which is why the modulo is 100 and not 10.
 */
export type SlForms = readonly [one: string, two: string, few: string, other: string];

export function slFormaOf(n: number, forms: SlForms): string {
  const r = Math.abs(Math.trunc(n)) % 100;
  if (r === 1) return forms[0];
  if (r === 2) return forms[1];
  if (r === 3 || r === 4) return forms[2];
  return forms[3];
}

/** "1 dan", "2 dneva", "3 dni", "5 dni". */
export function stevilo(n: number, forms: SlForms): string {
  return `${n} ${slFormaOf(n, forms)}`;
}

export const DAN: SlForms = ['dan', 'dneva', 'dni', 'dni'];
export const KOS: SlForms = ['kos', 'kosa', 'kosi', 'kosov'];
export const TEDEN: SlForms = ['teden', 'tedna', 'tedni', 'tednov'];
export const IZPOSOJA: SlForms = ['izposoja', 'izposoji', 'izposoje', 'izposoj'];
export const REZERVACIJA: SlForms = [
  'rezervacija',
  'rezervaciji',
  'rezervacije',
  'rezervacij',
];
