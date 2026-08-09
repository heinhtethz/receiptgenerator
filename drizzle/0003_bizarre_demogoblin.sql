ALTER TABLE "simple_expenses" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;