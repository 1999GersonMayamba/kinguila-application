CREATE TABLE IF NOT EXISTS "wallet_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"listed_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "minimum_amount" numeric(18, 2) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallet_balances" ADD CONSTRAINT "wallet_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_balances_user_currency_idx" ON "wallet_balances" USING btree ("user_id","currency");--> statement-breakpoint
ALTER TABLE "offers" DROP COLUMN IF EXISTS "available_amount";