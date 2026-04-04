ALTER TABLE "gifts" ADD COLUMN "quote_unit_cents" integer;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD COLUMN "quote_quantity" integer;--> statement-breakpoint
ALTER TABLE "gift_contributions" ADD COLUMN "quote_unit_cents" integer;