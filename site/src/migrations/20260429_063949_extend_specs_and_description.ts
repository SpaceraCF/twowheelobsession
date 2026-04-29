import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "new_bikes" ADD COLUMN "description_text" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_lubrication" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_fuel_system" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_ignition" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_starter" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_oil_capacity" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_final_drive" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_frame" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_length" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_width" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_height" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_wheelbase" varchar;
  ALTER TABLE "new_bikes" ADD COLUMN "specs_clearance" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "new_bikes" DROP COLUMN "description_text";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_lubrication";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_fuel_system";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_ignition";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_starter";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_oil_capacity";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_final_drive";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_frame";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_length";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_width";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_height";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_wheelbase";
  ALTER TABLE "new_bikes" DROP COLUMN "specs_clearance";`)
}
