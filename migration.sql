-- Clerk Migration SQL
-- Run this on your database if Prisma migration fails

-- Step 1: Add clerkId column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;

-- Step 2: Create unique index on clerkId
CREATE UNIQUE INDEX IF NOT EXISTS "user_clerkId_key" ON "user"("clerkId");

-- Step 3: Drop old Better Auth tables (no longer needed)
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;  
DROP TABLE IF EXISTS "verification" CASCADE;

-- Verification queries (run these to confirm):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user';
-- SELECT * FROM "user" LIMIT 1;
