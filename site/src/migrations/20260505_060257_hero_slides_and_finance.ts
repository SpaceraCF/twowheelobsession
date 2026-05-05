// Note: import types separately so this file is parseable by Node's
// native strip-types mode (used by `npm run migrate` via
// `--disable-transpile`). See migrations/index.ts for the same caveat
// on the .ts extensions in the index imports.
import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_enquiries_finance_term" AS ENUM('24', '36', '48', '60', '72');
  ALTER TYPE "public"."enum_enquiries_type" ADD VALUE 'finance' BEFORE 'parts';
  CREATE TABLE "hero_slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"link_url" varchar,
  	"order" numeric DEFAULT 100,
  	"active" boolean DEFAULT true,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "enquiries" ADD COLUMN "finance_deposit" numeric;
  ALTER TABLE "enquiries" ADD COLUMN "finance_trade_in" varchar;
  ALTER TABLE "enquiries" ADD COLUMN "finance_term" "enum_enquiries_finance_term";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hero_slides_id" integer;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "hero_slides_image_idx" ON "hero_slides" USING btree ("image_id");
  CREATE INDEX "hero_slides_updated_at_idx" ON "hero_slides" USING btree ("updated_at");
  CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_slides_fk" FOREIGN KEY ("hero_slides_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hero_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_slides_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hero_slides" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hero_slides" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hero_slides_fk";
  
  ALTER TABLE "enquiries" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_enquiries_type";
  CREATE TYPE "public"."enum_enquiries_type" AS ENUM('new-bike', 'used-bike', 'parts', 'general');
  ALTER TABLE "enquiries" ALTER COLUMN "type" SET DATA TYPE "public"."enum_enquiries_type" USING "type"::"public"."enum_enquiries_type";
  DROP INDEX "payload_locked_documents_rels_hero_slides_id_idx";
  ALTER TABLE "enquiries" DROP COLUMN "finance_deposit";
  ALTER TABLE "enquiries" DROP COLUMN "finance_trade_in";
  ALTER TABLE "enquiries" DROP COLUMN "finance_term";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hero_slides_id";
  DROP TYPE "public"."enum_enquiries_finance_term";`)
}
