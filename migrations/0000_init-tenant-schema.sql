CREATE TABLE "todo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "todo_org_owner_title_key" UNIQUE("org_id","owner_id","title")
);
--> statement-breakpoint
CREATE INDEX "todo_org_idx" ON "todo" USING btree ("org_id");