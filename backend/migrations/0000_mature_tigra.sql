CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"original_url" text NOT NULL,
	"source_name" varchar(100) NOT NULL,
	"language" varchar(2) NOT NULL,
	"published_at" timestamp NOT NULL,
	"raw_content" text,
	"ai_summary" text,
	"category" varchar(50),
	"sentiment" varchar(20),
	"reading_time" integer,
	"tags" text,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_digests" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"overall_summary" text,
	"top_categories" text,
	"total_articles" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"preferred_language" varchar(10) DEFAULT 'both',
	"categories" text,
	"sources" text,
	"summary_length" varchar(20) DEFAULT 'medium',
	"update_frequency" varchar(20) DEFAULT 'daily',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "language_idx" ON "articles" USING btree ("language");--> statement-breakpoint
CREATE INDEX "category_idx" ON "articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "articles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "date_idx" ON "daily_digests" USING btree ("date");