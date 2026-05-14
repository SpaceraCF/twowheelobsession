// Split type imports for Node strip-types compatibility — see
// migrations/index.ts.
import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_conversations_status" AS ENUM('open', 'closed');
  CREATE TYPE "public"."enum_messages_direction" AS ENUM('inbound', 'outbound');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('received', 'queued', 'sent', 'delivered', 'failed');
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone_number" varchar NOT NULL,
  	"display_name" varchar,
  	"display_label" varchar,
  	"status" "enum_conversations_status" DEFAULT 'open',
  	"assigned_to_id" integer,
  	"last_message_at" timestamp(3) with time zone,
  	"last_message_preview" varchar,
  	"unread_count" numeric DEFAULT 0,
  	"first_inbound_context" varchar,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"direction" "enum_messages_direction" NOT NULL,
  	"body" varchar NOT NULL,
  	"preview" varchar,
  	"twilio_message_sid" varchar,
  	"status" "enum_messages_status" DEFAULT 'received',
  	"sent_by_id" integer,
  	"error_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "conversations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "messages_id" integer;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "conversations_phone_number_idx" ON "conversations" USING btree ("phone_number");
  CREATE INDEX "conversations_assigned_to_idx" ON "conversations" USING btree ("assigned_to_id");
  CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");
  CREATE INDEX "messages_twilio_message_sid_idx" ON "messages" USING btree ("twilio_message_sid");
  CREATE INDEX "messages_sent_by_idx" ON "messages" USING btree ("sent_by_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "conversations" CASCADE;
  DROP TABLE "messages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_conversations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_messages_fk";
  
  DROP INDEX "payload_locked_documents_rels_conversations_id_idx";
  DROP INDEX "payload_locked_documents_rels_messages_id_idx";
  ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "conversations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "messages_id";
  DROP TYPE "public"."enum_conversations_status";
  DROP TYPE "public"."enum_messages_direction";
  DROP TYPE "public"."enum_messages_status";`)
}
