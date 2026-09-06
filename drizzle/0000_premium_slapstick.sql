CREATE TYPE "public"."loan_status" AS ENUM('reserved', 'out', 'returned', 'cancelled');--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"total_quantity" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_total_quantity_positive" CHECK ("items"."total_quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "loan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "loan_items_quantity_positive" CHECK ("loan_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"borrower_name" varchar(160) NOT NULL,
	"borrower_phone" varchar(40) NOT NULL,
	"purpose" text NOT NULL,
	"from_date" date NOT NULL,
	"to_date" date NOT NULL,
	"status" "loan_status" DEFAULT 'reserved' NOT NULL,
	"created_by_email" varchar(254) NOT NULL,
	"created_by_name" varchar(160),
	"handed_over_at" timestamp with time zone,
	"handed_over_by_email" varchar(254),
	"returned_at" timestamp with time zone,
	"returned_by_email" varchar(254),
	"return_condition_note" text,
	"cancelled_at" timestamp with time zone,
	"cancelled_by_email" varchar(254),
	"cancel_reason" text,
	"updated_by_email" varchar(254),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loans_date_order" CHECK ("loans"."from_date" <= "loans"."to_date")
);
--> statement-breakpoint
ALTER TABLE "loan_items" ADD CONSTRAINT "loan_items_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_items" ADD CONSTRAINT "loan_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "items_name_key" ON "items" USING btree ("name");--> statement-breakpoint
CREATE INDEX "items_active_sort_idx" ON "items" USING btree ("active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "loan_items_loan_item_key" ON "loan_items" USING btree ("loan_id","item_id");--> statement-breakpoint
CREATE INDEX "loan_items_item_loan_idx" ON "loan_items" USING btree ("item_id","loan_id");--> statement-breakpoint
CREATE INDEX "loans_active_range_idx" ON "loans" USING btree ("from_date","to_date") WHERE "loans"."status" in ('reserved', 'out');--> statement-breakpoint
CREATE INDEX "loans_status_from_idx" ON "loans" USING btree ("status","from_date");--> statement-breakpoint
CREATE INDEX "loans_to_date_idx" ON "loans" USING btree ("to_date");