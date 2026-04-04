CREATE TYPE "public"."media_status" AS ENUM('processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"thumb_key" text,
	"url" text NOT NULL,
	"thumb_url" text,
	"content_type" text NOT NULL,
	"original_name" text,
	"size" integer,
	"width" integer,
	"height" integer,
	"blurhash" text,
	"status" "media_status" DEFAULT 'processing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "gifts" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "media_id" uuid;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;