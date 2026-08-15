CREATE TYPE "public"."plan_tier" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "public"."sub_status" AS ENUM('active', 'past_due', 'canceled', 'trialing');--> statement-breakpoint
CREATE TYPE "public"."txn_direction" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text DEFAULT 'cash' NOT NULL,
	"currency_code" char(3) DEFAULT 'INR' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"ip" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT 'tag' NOT NULL,
	"direction" "txn_direction",
	"is_system" boolean DEFAULT false NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_rollups" (
	"user_id" uuid NOT NULL,
	"day" date NOT NULL,
	"currency_code" char(3) NOT NULL,
	"credit_minor" bigint DEFAULT 0 NOT NULL,
	"debit_minor" bigint DEFAULT 0 NOT NULL,
	"net_minor" bigint GENERATED ALWAYS AS (credit_minor - debit_minor) STORED,
	"txn_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "daily_rollups_user_id_day_currency_code_pk" PRIMARY KEY("user_id","day","currency_code")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"gender" text,
	"default_currency" char(3) DEFAULT 'INR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"plan" "plan_tier" DEFAULT 'free' NOT NULL,
	"notify_daily" boolean DEFAULT false NOT NULL,
	"notify_hour" smallint DEFAULT 21 NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"account_id" uuid,
	"direction" "txn_direction" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency_code" char(3) DEFAULT 'INR' NOT NULL,
	"note" text,
	"rrule" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"last_run_on" date,
	"is_paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_customer_id" text NOT NULL,
	"provider_sub_id" text NOT NULL,
	"plan" "plan_tier" NOT NULL,
	"status" "sub_status" NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "subscriptions_provider_sub_id_unique" UNIQUE("provider_sub_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"account_id" uuid,
	"category_id" uuid,
	"direction" "txn_direction" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency_code" char(3) DEFAULT 'INR' NOT NULL,
	"signed_minor" bigint GENERATED ALWAYS AS (case when direction = 'credit' then amount_minor else -amount_minor end) STORED,
	"occurred_on" date NOT NULL,
	"note" text,
	"recurring_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_balances" (
	"user_id" uuid NOT NULL,
	"currency_code" char(3) NOT NULL,
	"balance_minor" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_balances_user_id_currency_code_pk" PRIMARY KEY("user_id","currency_code")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_id_recurring_rules_id_fk" FOREIGN KEY ("recurring_id") REFERENCES "public"."recurring_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_user_id_name_unq" ON "accounts" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_id_name_unq" ON "categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_categories_user" ON "categories" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_recurring_due" ON "recurring_rules" USING btree ("last_run_on") WHERE is_paused = false;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_txn_client" ON "transactions" USING btree ("user_id","client_id");--> statement-breakpoint
CREATE INDEX "idx_txn_list" ON "transactions" USING btree ("user_id","occurred_on","id") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_txn_category" ON "transactions" USING btree ("user_id","category_id","occurred_on") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_txn_sync" ON "transactions" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "idx_txn_account" ON "transactions" USING btree ("user_id","account_id","occurred_on") WHERE deleted_at is null;