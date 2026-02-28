// Script to find and clean up duplicate emails
// Run with: npx tsx check-duplicates.ts

import { db } from "./src/server/db";

async function checkDuplicates() {
  // Find duplicate emails
  const duplicates = await db.$queryRaw<Array<{ email: string; count: bigint }>>`
    SELECT email, COUNT(*) as count
    FROM "user"
    GROUP BY email
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log("✅ No duplicate emails found!");
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate emails:`);
  
  for (const dup of duplicates) {
    console.log(`\nEmail: ${dup.email} (${dup.count} occurrences)`);
    
    // Get all users with this email
    const users = await db.user.findMany({
      where: { email: dup.email },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        credits: true,
        extraCredits: true,
        subscriptionPlan: true,
        createdAt: true,
      },
    });

    console.log("Users with this email:");
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, ClerkID: ${user.clerkId}, Credits: ${user.credits}, Extra: ${user.extraCredits}, Plan: ${user.subscriptionPlan || 'none'}, Created: ${user.createdAt}`);
    });

    // Keep the one with the most credits or latest subscription
    const keepUser = users.reduce((best, current) => {
      const bestTotal = best.credits + best.extraCredits;
      const currentTotal = current.credits + current.extraCredits;
      
      if (current.subscriptionPlan && !best.subscriptionPlan) return current;
      if (currentTotal > bestTotal) return current;
      return best;
    });

    console.log(`  ✅ Keeping: ${keepUser.id} (${keepUser.clerkId})`);

    // Delete the others
    const toDelete = users.filter(u => u.id !== keepUser.id);
    for (const user of toDelete) {
      console.log(`  ❌ Deleting: ${user.id} (${user.clerkId})`);
      await db.user.delete({ where: { id: user.id } });
    }
  }

  console.log("\n✅ Cleanup complete!");
}

checkDuplicates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
