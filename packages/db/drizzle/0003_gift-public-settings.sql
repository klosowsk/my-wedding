ALTER TABLE "gifts" ADD COLUMN "contribution_mode" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "gifts" ADD COLUMN "fixed_contribution_options" text;--> statement-breakpoint
ALTER TABLE "gifts" ADD COLUMN "show_collected_amount" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "gifts" ADD COLUMN "show_goal_amount" boolean DEFAULT true NOT NULL;