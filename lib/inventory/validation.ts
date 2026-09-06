import { z } from 'zod';
import { daysInclusive } from '../dates';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum mora biti v obliki LLLL-MM-DD.')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Neveljaven datum.');

export const loanItemLineSchema = z.object({
  itemId: z.coerce.number().int().positive('Izberite opremo.'),
  quantity: z.coerce
    .number()
    .int('Število kosov mora biti celo število.')
    .positive('Število kosov mora biti večje od 0.'),
});

export const loanInputSchema = z
  .object({
    borrowerName: z.string().trim().min(2, 'Vnesite ime in priimek.').max(160),
    borrowerPhone: z
      .string()
      .trim()
      .min(6, 'Vnesite telefonsko številko.')
      .max(40)
      .regex(/^[+0-9 ()/-]+$/, 'Telefonska številka lahko vsebuje le številke in znake + ( ) / -'),
    purpose: z.string().trim().min(2, 'Vnesite dogodek oziroma namen.').max(2000),
    fromDate: isoDate,
    toDate: isoDate,
    items: z.array(loanItemLineSchema).min(1, 'Dodajte vsaj en kos opreme.'),
  })
  .refine((v) => v.fromDate <= v.toDate, {
    message: 'Datum "do" ne more biti pred datumom "od".',
    path: ['toDate'],
  })
  .refine((v) => daysInclusive(v.fromDate, v.toDate) <= 365, {
    message: 'Obdobje ne more biti daljše od enega leta.',
    path: ['toDate'],
  })
  .refine((v) => new Set(v.items.map((i) => i.itemId)).size === v.items.length, {
    message: 'Vsak kos opreme lahko dodate samo enkrat - združite vrstici.',
    path: ['items'],
  });

export type LoanInput = z.infer<typeof loanInputSchema>;

export const itemInputSchema = z.object({
  name: z.string().trim().min(2, 'Vnesite ime opreme.').max(120),
  totalQuantity: z.coerce
    .number()
    .int('Število kosov mora biti celo število.')
    .positive('Število kosov mora biti večje od 0.'),
  active: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type ItemInput = z.infer<typeof itemInputSchema>;

export const returnInputSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  returnConditionNote: z.string().trim().max(2000).optional().or(z.literal('')),
  extendToToday: z.coerce.boolean().optional(),
});

export const dateRangeSchema = z
  .object({ od: isoDate, do: isoDate })
  .refine((v) => v.od <= v.do, { message: 'Neveljavno obdobje.', path: ['do'] });

/** Parse repeatable `itemId[]` / `quantity[]` form fields into item lines. */
export function parseItemLines(formData: FormData): { itemId: number; quantity: number }[] {
  const ids = formData.getAll('itemId').map(String);
  const qtys = formData.getAll('quantity').map(String);
  const lines: { itemId: number; quantity: number }[] = [];

  for (let i = 0; i < ids.length; i++) {
    const itemId = Number(ids[i]);
    const quantity = Number(qtys[i] ?? '0');
    if (!Number.isFinite(itemId) || itemId <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    lines.push({ itemId, quantity });
  }
  return lines;
}
