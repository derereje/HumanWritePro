-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "credits" SET DEFAULT 500;

-- Data Migration: Convert existing credits from old system (100 words = 10 credits) to new system (1 credit = 1 word)
-- Multiply existing credits by 10 to maintain same value in word count
UPDATE "public"."user" 
SET credits = credits * 10 
WHERE credits > 0 AND credits < 10000;
