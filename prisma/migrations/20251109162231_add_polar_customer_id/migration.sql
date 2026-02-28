-- DropIndex
DROP INDEX "public"."user_email_key";

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "polarCustomerId" TEXT;
