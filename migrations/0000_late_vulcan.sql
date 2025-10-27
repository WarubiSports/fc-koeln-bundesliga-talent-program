CREATE TABLE IF NOT EXISTS "apps" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"api_key_hash" varchar(128) NOT NULL,
	"allowed_origins" text NOT NULL,
	"rate_limit_per_min" integer DEFAULT 600 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
