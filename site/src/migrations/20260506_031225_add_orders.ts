// Split type imports for Node strip-types compatibility (`npm run migrate`
// runs with --disable-transpile). See migrations/index.ts.
import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('paid', 'processing', 'shipped', 'picked-up', 'completed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_shipping_method" AS ENUM('au-flat', 'pickup');
  CREATE TYPE "public"."enum_orders_state" AS ENUM('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT');
  CREATE TABLE "orders_line_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sku" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"qty" numeric NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"line_total" numeric NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'paid',
  	"shipping_method" "enum_orders_shipping_method" NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"suburb" varchar,
  	"state" "enum_orders_state",
  	"postcode" varchar,
  	"subtotal" numeric NOT NULL,
  	"shipping" numeric NOT NULL,
  	"total" numeric NOT NULL,
  	"paypal_env" varchar,
  	"paypal_order_id" varchar,
  	"paypal_capture_id" varchar,
  	"paypal_capture_status" varchar,
  	"paypal_payer_email" varchar,
  	"fulfilment_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "orders_line_items" ADD CONSTRAINT "orders_line_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_line_items_order_idx" ON "orders_line_items" USING btree ("_order");
  CREATE INDEX "orders_line_items_parent_id_idx" ON "orders_line_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_paypal_order_id_idx" ON "orders" USING btree ("paypal_order_id");
  CREATE INDEX "orders_paypal_capture_id_idx" ON "orders" USING btree ("paypal_capture_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_line_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_line_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_shipping_method";
  DROP TYPE "public"."enum_orders_state";`)
}
