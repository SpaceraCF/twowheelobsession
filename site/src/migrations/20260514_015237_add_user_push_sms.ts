// Split type imports for Node strip-types compatibility — see
// migrations/index.ts.
import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_push_subscriptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"endpoint" varchar NOT NULL,
  	"p256dh" varchar NOT NULL,
  	"auth" varchar NOT NULL,
  	"user_agent" varchar,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "personal_mobile" varchar;
  ALTER TABLE "users" ADD COLUMN "sms_fan_out_enabled" boolean DEFAULT false;
  ALTER TABLE "users_push_subscriptions" ADD CONSTRAINT "users_push_subscriptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_push_subscriptions_order_idx" ON "users_push_subscriptions" USING btree ("_order");
  CREATE INDEX "users_push_subscriptions_parent_id_idx" ON "users_push_subscriptions" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_push_subscriptions" CASCADE;
  ALTER TABLE "users" DROP COLUMN "personal_mobile";
  ALTER TABLE "users" DROP COLUMN "sms_fan_out_enabled";`)
}
