-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "public"."team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sharedCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team" ADD CONSTRAINT "team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
