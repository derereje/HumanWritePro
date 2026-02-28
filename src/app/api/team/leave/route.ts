import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { team: true },
    });

    // Fallback: If user not found in DB (webhook delay), create on the fly
    if (!user) {
      console.log("⚠️ [Team Leave API] User not found in DB, creating on the fly...");
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress || "";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";
          
          const newUser = await db.user.create({
            data: {
              clerkId: userId,
              email,
              name,
              image: clerkUser.imageUrl,
              emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
              // credits will default to 300 from schema
            }
          });
          
          // Refetch with relations
          user = await db.user.findUnique({
            where: { id: newUser.id },
            include: { team: true },
          });
        }
      } catch (syncError) {
        console.error("❌ [Team Leave API] Failed to sync user from Clerk:", syncError);
      }
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.teamId) {
      return new NextResponse("User is not in a team", { status: 400 });
    }

    // Check if user is the owner
    if (user.team?.ownerId === user.id) {
      return NextResponse.json(
        { error: "Team owners cannot leave their own team. Please delete the team instead." },
        { status: 400 }
      );
    }

    // Remove user from team
    await db.user.update({
      where: { id: user.id },
      data: { teamId: null },
    });

    return NextResponse.json({ message: "Successfully left the team" });
  } catch (error) {
    console.error("[TEAM_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
