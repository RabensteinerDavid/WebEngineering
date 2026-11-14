ALTER TABLE "comments" ADD COLUMN "report_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "hidden_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "report_count_nonnegative" CHECK ("comments"."report_count" >= 0);