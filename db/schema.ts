import { sql, relations } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const loanStatus = pgEnum('loan_status', ['reserved', 'out', 'returned', 'cancelled']);

export const items = pgTable(
  'items',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    totalQuantity: integer('total_quantity').notNull(),
    active: boolean('active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('items_name_key').on(t.name), // makes the seed idempotent
    index('items_active_sort_idx').on(t.active, t.sortOrder),
    check('items_total_quantity_positive', sql`${t.totalQuantity} > 0`),
  ],
);

export const loans = pgTable(
  'loans',
  {
    id: serial('id').primaryKey(),
    borrowerName: varchar('borrower_name', { length: 160 }).notNull(),
    borrowerPhone: varchar('borrower_phone', { length: 40 }).notNull(),
    purpose: text('purpose').notNull(),

    // Both INCLUSIVE. See lib/inventory/availability.ts for the semantics.
    fromDate: date('from_date', { mode: 'string' }).notNull(),
    toDate: date('to_date', { mode: 'string' }).notNull(),

    status: loanStatus('status').notNull().default('reserved'),

    // Actor stamps: this is how the system answers "who promised this?" - the question
    // the paper textbook could not. Denormalised on purpose, so the trail stays correct
    // even after someone leaves the allowlist.
    createdByEmail: varchar('created_by_email', { length: 254 }).notNull(),
    createdByName: varchar('created_by_name', { length: 160 }),
    handedOverAt: timestamp('handed_over_at', { withTimezone: true }),
    handedOverByEmail: varchar('handed_over_by_email', { length: 254 }),
    returnedAt: timestamp('returned_at', { withTimezone: true }),
    returnedByEmail: varchar('returned_by_email', { length: 254 }),
    returnConditionNote: text('return_condition_note'),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledByEmail: varchar('cancelled_by_email', { length: 254 }),
    cancelReason: text('cancel_reason'),
    updatedByEmail: varchar('updated_by_email', { length: 254 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('loans_date_order', sql`${t.fromDate} <= ${t.toDate}`),
    // The index for the overlap query. Partial, so returned/cancelled history - which
    // will be the vast majority of rows over the years, and can never match - stays out.
    index('loans_active_range_idx')
      .on(t.fromDate, t.toDate)
      .where(sql`${t.status} in ('reserved', 'out')`),
    index('loans_status_from_idx').on(t.status, t.fromDate),
    index('loans_to_date_idx').on(t.toDate),
  ],
);

export const loanItems = pgTable(
  'loan_items',
  {
    id: serial('id').primaryKey(),
    loanId: integer('loan_id')
      .notNull()
      .references(() => loans.id, { onDelete: 'cascade' }),
    // 'restrict' makes "you cannot delete equipment that has history" a database
    // invariant rather than a UI convention. Retirement is `active = false`.
    itemId: integer('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
  },
  (t) => [
    uniqueIndex('loan_items_loan_item_key').on(t.loanId, t.itemId),
    index('loan_items_item_loan_idx').on(t.itemId, t.loanId),
    check('loan_items_quantity_positive', sql`${t.quantity} > 0`),
  ],
);

export const loansRelations = relations(loans, ({ many }) => ({
  items: many(loanItems),
}));

export const loanItemsRelations = relations(loanItems, ({ one }) => ({
  loan: one(loans, { fields: [loanItems.loanId], references: [loans.id] }),
  item: one(items, { fields: [loanItems.itemId], references: [items.id] }),
}));

export type Item = typeof items.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type LoanItem = typeof loanItems.$inferSelect;
