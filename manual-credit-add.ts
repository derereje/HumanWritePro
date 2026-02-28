// Manual script to add credits for testing
// Run with: npx tsx manual-credit-add.ts

import { db } from "./src/server/db";

async function addCredits() {
  const clerkId = "YOUR_CLERK_ID_HERE"; // Replace with your actual Clerk ID
  const creditsToAdd = 20000;
  
  const user = await db.user.update({
    where: { clerkId },
    data: {
      credits: { increment: creditsToAdd },
      subscriptionPlan: "pro",
      maxWordsPerRequest: 2000,
    },
  });
  
  console.log("Credits added successfully:", {
    userId: user.id,
    newBalance: user.credits,
    plan: user.subscriptionPlan,
  });
}

addCredits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
