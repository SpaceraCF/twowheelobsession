import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'staff');
  CREATE TYPE "public"."enum_bike_categories_group" AS ENUM('road', 'off-road', 'atv', 'other');
  CREATE TYPE "public"."enum_new_bikes_source" AS ENUM('yamaha-api', 'manual');
  CREATE TYPE "public"."enum_new_bikes_status" AS ENUM('available', 'pre-order', 'discontinued', 'hidden');
  CREATE TYPE "public"."enum_used_bikes_body_type" AS ENUM('sport', 'naked', 'cruiser', 'sport-touring', 'touring', 'adventure', 'scooter', 'enduro', 'motocross', 'dual-sport', 'atv', 'other');
  CREATE TYPE "public"."enum_used_bikes_transmission" AS ENUM('manual', 'automatic', 'semi-auto', 'cvt');
  CREATE TYPE "public"."enum_used_bikes_condition" AS ENUM('used', 'demo');
  CREATE TYPE "public"."enum_used_bikes_registration_status" AS ENUM('registered', 'unregistered');
  CREATE TYPE "public"."enum_used_bikes_registration_state" AS ENUM('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT');
  CREATE TYPE "public"."enum_used_bikes_listing_status" AS ENUM('draft', 'available', 'on-hold', 'sold', 'archived');
  CREATE TYPE "public"."enum_used_bikes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__used_bikes_v_version_body_type" AS ENUM('sport', 'naked', 'cruiser', 'sport-touring', 'touring', 'adventure', 'scooter', 'enduro', 'motocross', 'dual-sport', 'atv', 'other');
  CREATE TYPE "public"."enum__used_bikes_v_version_transmission" AS ENUM('manual', 'automatic', 'semi-auto', 'cvt');
  CREATE TYPE "public"."enum__used_bikes_v_version_condition" AS ENUM('used', 'demo');
  CREATE TYPE "public"."enum__used_bikes_v_version_registration_status" AS ENUM('registered', 'unregistered');
  CREATE TYPE "public"."enum__used_bikes_v_version_registration_state" AS ENUM('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT');
  CREATE TYPE "public"."enum__used_bikes_v_version_listing_status" AS ENUM('draft', 'available', 'on-hold', 'sold', 'archived');
  CREATE TYPE "public"."enum__used_bikes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_enquiries_type" AS ENUM('new-bike', 'used-bike', 'parts', 'general');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'contacted', 'in-progress', 'closed-won', 'closed-lost', 'spam');
  CREATE TYPE "public"."enum_service_requests_service_type" AS ENUM('scheduled', 'repair', 'tyres', 'inspection', 'warranty', 'other');
  CREATE TYPE "public"."enum_service_requests_status" AS ENUM('new', 'confirmed', 'in-workshop', 'ready', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'staff',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_syndication_url" varchar,
  	"sizes_syndication_width" numeric,
  	"sizes_syndication_height" numeric,
  	"sizes_syndication_mime_type" varchar,
  	"sizes_syndication_filesize" numeric,
  	"sizes_syndication_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"logo_id" integer,
  	"description" varchar,
  	"display_order" numeric DEFAULT 100,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bike_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"group" "enum_bike_categories_group" NOT NULL,
  	"image_id" integer,
  	"description" varchar,
  	"display_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "new_bikes_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar
  );
  
  CREATE TABLE "new_bikes_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "new_bikes_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"hex" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "new_bikes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"tagline" varchar,
  	"description" jsonb,
  	"brand_id" integer NOT NULL,
  	"category_id" integer,
  	"year" numeric,
  	"model_code" varchar,
  	"base_model" varchar,
  	"price" numeric,
  	"price_label" varchar,
  	"primary_image_id" integer,
  	"external_image_url" varchar,
  	"brochure_url" varchar,
  	"specs_engine_displacement" varchar,
  	"specs_engine_type" varchar,
  	"specs_bore" varchar,
  	"specs_compression" varchar,
  	"specs_fuel_tank" varchar,
  	"specs_weight" varchar,
  	"specs_seat_height" varchar,
  	"specs_transmission" varchar,
  	"specs_front_brakes" varchar,
  	"specs_rear_brakes" varchar,
  	"specs_front_suspension" varchar,
  	"specs_rear_suspension" varchar,
  	"specs_front_tyre" varchar,
  	"specs_rear_tyre" varchar,
  	"source" "enum_new_bikes_source" DEFAULT 'manual' NOT NULL,
  	"external_id" varchar,
  	"last_synced_at" timestamp(3) with time zone,
  	"raw_api_data" jsonb,
  	"status" "enum_new_bikes_status" DEFAULT 'available' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "used_bikes_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar
  );
  
  CREATE TABLE "used_bikes_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "used_bikes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stock_number" varchar,
  	"display_name" varchar,
  	"slug" varchar,
  	"tagline" varchar,
  	"description" jsonb,
  	"year" numeric,
  	"brand_id" integer,
  	"model" varchar,
  	"variant" varchar,
  	"category_id" integer,
  	"body_type" "enum_used_bikes_body_type",
  	"engine_cc" numeric,
  	"cylinders" numeric,
  	"transmission" "enum_used_bikes_transmission",
  	"kms" numeric,
  	"condition" "enum_used_bikes_condition" DEFAULT 'used',
  	"color" varchar,
  	"vin" varchar,
  	"engine_number" varchar,
  	"registration_status" "enum_used_bikes_registration_status",
  	"registration_state" "enum_used_bikes_registration_state",
  	"registration_expiry_date" timestamp(3) with time zone,
  	"compliance_date" timestamp(3) with time zone,
  	"build_date" timestamp(3) with time zone,
  	"price" numeric,
  	"price_label" varchar DEFAULT 'Drive away',
  	"listing_status" "enum_used_bikes_listing_status" DEFAULT 'draft',
  	"sold_date" timestamp(3) with time zone,
  	"syndication_bikesales_enabled" boolean DEFAULT true,
  	"syndication_bikesales_external_id" varchar,
  	"syndication_bikesales_last_feed_at" timestamp(3) with time zone,
  	"syndication_bikesales_last_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_used_bikes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_used_bikes_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_used_bikes_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_used_bikes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_stock_number" varchar,
  	"version_display_name" varchar,
  	"version_slug" varchar,
  	"version_tagline" varchar,
  	"version_description" jsonb,
  	"version_year" numeric,
  	"version_brand_id" integer,
  	"version_model" varchar,
  	"version_variant" varchar,
  	"version_category_id" integer,
  	"version_body_type" "enum__used_bikes_v_version_body_type",
  	"version_engine_cc" numeric,
  	"version_cylinders" numeric,
  	"version_transmission" "enum__used_bikes_v_version_transmission",
  	"version_kms" numeric,
  	"version_condition" "enum__used_bikes_v_version_condition" DEFAULT 'used',
  	"version_color" varchar,
  	"version_vin" varchar,
  	"version_engine_number" varchar,
  	"version_registration_status" "enum__used_bikes_v_version_registration_status",
  	"version_registration_state" "enum__used_bikes_v_version_registration_state",
  	"version_registration_expiry_date" timestamp(3) with time zone,
  	"version_compliance_date" timestamp(3) with time zone,
  	"version_build_date" timestamp(3) with time zone,
  	"version_price" numeric,
  	"version_price_label" varchar DEFAULT 'Drive away',
  	"version_listing_status" "enum__used_bikes_v_version_listing_status" DEFAULT 'draft',
  	"version_sold_date" timestamp(3) with time zone,
  	"version_syndication_bikesales_enabled" boolean DEFAULT true,
  	"version_syndication_bikesales_external_id" varchar,
  	"version_syndication_bikesales_last_feed_at" timestamp(3) with time zone,
  	"version_syndication_bikesales_last_error" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__used_bikes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "enquiries_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"author_id" integer
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_enquiries_type" NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" varchar,
  	"message" varchar NOT NULL,
  	"new_bike_id" integer,
  	"used_bike_id" integer,
  	"page_url" varchar,
  	"user_agent" varchar,
  	"status" "enum_enquiries_status" DEFAULT 'new',
  	"assigned_to_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "service_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"bike_make" varchar NOT NULL,
  	"bike_model" varchar NOT NULL,
  	"bike_year" numeric,
  	"bike_kms" numeric,
  	"bike_rego" varchar,
  	"service_type" "enum_service_requests_service_type" NOT NULL,
  	"preferred_date" timestamp(3) with time zone,
  	"description" varchar NOT NULL,
  	"status" "enum_service_requests_status" DEFAULT 'new',
  	"booked_date" timestamp(3) with time zone,
  	"estimated_cost" numeric,
  	"actual_cost" numeric,
  	"workshop_notes" varchar,
  	"display_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"brands_id" integer,
  	"bike_categories_id" integer,
  	"new_bikes_id" integer,
  	"used_bikes_id" integer,
  	"enquiries_id" integer,
  	"service_requests_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bike_categories" ADD CONSTRAINT "bike_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "new_bikes_features" ADD CONSTRAINT "new_bikes_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."new_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "new_bikes_gallery" ADD CONSTRAINT "new_bikes_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "new_bikes_gallery" ADD CONSTRAINT "new_bikes_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."new_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "new_bikes_colors" ADD CONSTRAINT "new_bikes_colors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "new_bikes_colors" ADD CONSTRAINT "new_bikes_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."new_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "new_bikes" ADD CONSTRAINT "new_bikes_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "new_bikes" ADD CONSTRAINT "new_bikes_category_id_bike_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."bike_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "new_bikes" ADD CONSTRAINT "new_bikes_primary_image_id_media_id_fk" FOREIGN KEY ("primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "used_bikes_features" ADD CONSTRAINT "used_bikes_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."used_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "used_bikes_photos" ADD CONSTRAINT "used_bikes_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "used_bikes_photos" ADD CONSTRAINT "used_bikes_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."used_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "used_bikes" ADD CONSTRAINT "used_bikes_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "used_bikes" ADD CONSTRAINT "used_bikes_category_id_bike_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."bike_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_used_bikes_v_version_features" ADD CONSTRAINT "_used_bikes_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_used_bikes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_used_bikes_v_version_photos" ADD CONSTRAINT "_used_bikes_v_version_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_used_bikes_v_version_photos" ADD CONSTRAINT "_used_bikes_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_used_bikes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_used_bikes_v" ADD CONSTRAINT "_used_bikes_v_parent_id_used_bikes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."used_bikes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_used_bikes_v" ADD CONSTRAINT "_used_bikes_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_used_bikes_v" ADD CONSTRAINT "_used_bikes_v_version_category_id_bike_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."bike_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_notes" ADD CONSTRAINT "enquiries_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries_notes" ADD CONSTRAINT "enquiries_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_new_bike_id_new_bikes_id_fk" FOREIGN KEY ("new_bike_id") REFERENCES "public"."new_bikes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_used_bike_id_used_bikes_id_fk" FOREIGN KEY ("used_bike_id") REFERENCES "public"."used_bikes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bike_categories_fk" FOREIGN KEY ("bike_categories_id") REFERENCES "public"."bike_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_new_bikes_fk" FOREIGN KEY ("new_bikes_id") REFERENCES "public"."new_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_used_bikes_fk" FOREIGN KEY ("used_bikes_id") REFERENCES "public"."used_bikes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_requests_fk" FOREIGN KEY ("service_requests_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_syndication_sizes_syndication_filename_idx" ON "media" USING btree ("sizes_syndication_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE UNIQUE INDEX "bike_categories_slug_idx" ON "bike_categories" USING btree ("slug");
  CREATE INDEX "bike_categories_image_idx" ON "bike_categories" USING btree ("image_id");
  CREATE INDEX "bike_categories_updated_at_idx" ON "bike_categories" USING btree ("updated_at");
  CREATE INDEX "bike_categories_created_at_idx" ON "bike_categories" USING btree ("created_at");
  CREATE INDEX "new_bikes_features_order_idx" ON "new_bikes_features" USING btree ("_order");
  CREATE INDEX "new_bikes_features_parent_id_idx" ON "new_bikes_features" USING btree ("_parent_id");
  CREATE INDEX "new_bikes_gallery_order_idx" ON "new_bikes_gallery" USING btree ("_order");
  CREATE INDEX "new_bikes_gallery_parent_id_idx" ON "new_bikes_gallery" USING btree ("_parent_id");
  CREATE INDEX "new_bikes_gallery_image_idx" ON "new_bikes_gallery" USING btree ("image_id");
  CREATE INDEX "new_bikes_colors_order_idx" ON "new_bikes_colors" USING btree ("_order");
  CREATE INDEX "new_bikes_colors_parent_id_idx" ON "new_bikes_colors" USING btree ("_parent_id");
  CREATE INDEX "new_bikes_colors_image_idx" ON "new_bikes_colors" USING btree ("image_id");
  CREATE UNIQUE INDEX "new_bikes_slug_idx" ON "new_bikes" USING btree ("slug");
  CREATE INDEX "new_bikes_brand_idx" ON "new_bikes" USING btree ("brand_id");
  CREATE INDEX "new_bikes_category_idx" ON "new_bikes" USING btree ("category_id");
  CREATE INDEX "new_bikes_primary_image_idx" ON "new_bikes" USING btree ("primary_image_id");
  CREATE INDEX "new_bikes_external_id_idx" ON "new_bikes" USING btree ("external_id");
  CREATE INDEX "new_bikes_updated_at_idx" ON "new_bikes" USING btree ("updated_at");
  CREATE INDEX "new_bikes_created_at_idx" ON "new_bikes" USING btree ("created_at");
  CREATE INDEX "used_bikes_features_order_idx" ON "used_bikes_features" USING btree ("_order");
  CREATE INDEX "used_bikes_features_parent_id_idx" ON "used_bikes_features" USING btree ("_parent_id");
  CREATE INDEX "used_bikes_photos_order_idx" ON "used_bikes_photos" USING btree ("_order");
  CREATE INDEX "used_bikes_photos_parent_id_idx" ON "used_bikes_photos" USING btree ("_parent_id");
  CREATE INDEX "used_bikes_photos_image_idx" ON "used_bikes_photos" USING btree ("image_id");
  CREATE UNIQUE INDEX "used_bikes_stock_number_idx" ON "used_bikes" USING btree ("stock_number");
  CREATE UNIQUE INDEX "used_bikes_slug_idx" ON "used_bikes" USING btree ("slug");
  CREATE INDEX "used_bikes_brand_idx" ON "used_bikes" USING btree ("brand_id");
  CREATE INDEX "used_bikes_category_idx" ON "used_bikes" USING btree ("category_id");
  CREATE INDEX "used_bikes_updated_at_idx" ON "used_bikes" USING btree ("updated_at");
  CREATE INDEX "used_bikes_created_at_idx" ON "used_bikes" USING btree ("created_at");
  CREATE INDEX "used_bikes__status_idx" ON "used_bikes" USING btree ("_status");
  CREATE INDEX "_used_bikes_v_version_features_order_idx" ON "_used_bikes_v_version_features" USING btree ("_order");
  CREATE INDEX "_used_bikes_v_version_features_parent_id_idx" ON "_used_bikes_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_used_bikes_v_version_photos_order_idx" ON "_used_bikes_v_version_photos" USING btree ("_order");
  CREATE INDEX "_used_bikes_v_version_photos_parent_id_idx" ON "_used_bikes_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_used_bikes_v_version_photos_image_idx" ON "_used_bikes_v_version_photos" USING btree ("image_id");
  CREATE INDEX "_used_bikes_v_parent_idx" ON "_used_bikes_v" USING btree ("parent_id");
  CREATE INDEX "_used_bikes_v_version_version_stock_number_idx" ON "_used_bikes_v" USING btree ("version_stock_number");
  CREATE INDEX "_used_bikes_v_version_version_slug_idx" ON "_used_bikes_v" USING btree ("version_slug");
  CREATE INDEX "_used_bikes_v_version_version_brand_idx" ON "_used_bikes_v" USING btree ("version_brand_id");
  CREATE INDEX "_used_bikes_v_version_version_category_idx" ON "_used_bikes_v" USING btree ("version_category_id");
  CREATE INDEX "_used_bikes_v_version_version_updated_at_idx" ON "_used_bikes_v" USING btree ("version_updated_at");
  CREATE INDEX "_used_bikes_v_version_version_created_at_idx" ON "_used_bikes_v" USING btree ("version_created_at");
  CREATE INDEX "_used_bikes_v_version_version__status_idx" ON "_used_bikes_v" USING btree ("version__status");
  CREATE INDEX "_used_bikes_v_created_at_idx" ON "_used_bikes_v" USING btree ("created_at");
  CREATE INDEX "_used_bikes_v_updated_at_idx" ON "_used_bikes_v" USING btree ("updated_at");
  CREATE INDEX "_used_bikes_v_latest_idx" ON "_used_bikes_v" USING btree ("latest");
  CREATE INDEX "_used_bikes_v_autosave_idx" ON "_used_bikes_v" USING btree ("autosave");
  CREATE INDEX "enquiries_notes_order_idx" ON "enquiries_notes" USING btree ("_order");
  CREATE INDEX "enquiries_notes_parent_id_idx" ON "enquiries_notes" USING btree ("_parent_id");
  CREATE INDEX "enquiries_notes_author_idx" ON "enquiries_notes" USING btree ("author_id");
  CREATE INDEX "enquiries_new_bike_idx" ON "enquiries" USING btree ("new_bike_id");
  CREATE INDEX "enquiries_used_bike_idx" ON "enquiries" USING btree ("used_bike_id");
  CREATE INDEX "enquiries_assigned_to_idx" ON "enquiries" USING btree ("assigned_to_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "service_requests_updated_at_idx" ON "service_requests" USING btree ("updated_at");
  CREATE INDEX "service_requests_created_at_idx" ON "service_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_bike_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("bike_categories_id");
  CREATE INDEX "payload_locked_documents_rels_new_bikes_id_idx" ON "payload_locked_documents_rels" USING btree ("new_bikes_id");
  CREATE INDEX "payload_locked_documents_rels_used_bikes_id_idx" ON "payload_locked_documents_rels" USING btree ("used_bikes_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_service_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("service_requests_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "bike_categories" CASCADE;
  DROP TABLE "new_bikes_features" CASCADE;
  DROP TABLE "new_bikes_gallery" CASCADE;
  DROP TABLE "new_bikes_colors" CASCADE;
  DROP TABLE "new_bikes" CASCADE;
  DROP TABLE "used_bikes_features" CASCADE;
  DROP TABLE "used_bikes_photos" CASCADE;
  DROP TABLE "used_bikes" CASCADE;
  DROP TABLE "_used_bikes_v_version_features" CASCADE;
  DROP TABLE "_used_bikes_v_version_photos" CASCADE;
  DROP TABLE "_used_bikes_v" CASCADE;
  DROP TABLE "enquiries_notes" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "service_requests" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_bike_categories_group";
  DROP TYPE "public"."enum_new_bikes_source";
  DROP TYPE "public"."enum_new_bikes_status";
  DROP TYPE "public"."enum_used_bikes_body_type";
  DROP TYPE "public"."enum_used_bikes_transmission";
  DROP TYPE "public"."enum_used_bikes_condition";
  DROP TYPE "public"."enum_used_bikes_registration_status";
  DROP TYPE "public"."enum_used_bikes_registration_state";
  DROP TYPE "public"."enum_used_bikes_listing_status";
  DROP TYPE "public"."enum_used_bikes_status";
  DROP TYPE "public"."enum__used_bikes_v_version_body_type";
  DROP TYPE "public"."enum__used_bikes_v_version_transmission";
  DROP TYPE "public"."enum__used_bikes_v_version_condition";
  DROP TYPE "public"."enum__used_bikes_v_version_registration_status";
  DROP TYPE "public"."enum__used_bikes_v_version_registration_state";
  DROP TYPE "public"."enum__used_bikes_v_version_listing_status";
  DROP TYPE "public"."enum__used_bikes_v_version_status";
  DROP TYPE "public"."enum_enquiries_type";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_service_requests_service_type";
  DROP TYPE "public"."enum_service_requests_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
