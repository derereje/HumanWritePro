import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

// POST - Add member to team
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    // Fallback: If user not found in DB (webhook delay), create on the fly
    if (!user) {
      console.log("⚠️ [Team Members POST] User not found in DB, creating on the fly...");
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress || "";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";
          
          user = await db.user.create({
            data: {
              clerkId: userId,
              email,
              name,
              image: clerkUser.imageUrl,
              emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
              // credits will default to 300 from schema
            }
          });
        }
      } catch (syncError) {
        console.error("❌ [Team Members POST] Failed to sync user from Clerk:", syncError);
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { teamId, memberEmail } = body;

    if (!teamId || !memberEmail) {
      return NextResponse.json(
        { error: "Team ID and member email are required" },
        { status: 400 }
      );
    }

    // Check if user owns the team
    const team = await db.team.findFirst({
      where: {
        id: teamId,
        ownerId: user.id,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Find member by email
    const memberToAdd = await db.user.findFirst({
      where: { email: memberEmail.trim().toLowerCase() },
    });

    if (!memberToAdd) {
      return NextResponse.json(
        { error: "User with this email not found" },
        { status: 404 }
      );
    }

    // Check if member is already in a team
    if (memberToAdd.teamId) {
      return NextResponse.json(
        { error: "User is already in a team" },
        { status: 400 }
      );
    }

    // Add member to team
    await db.user.update({
      where: { id: memberToAdd.id },
      data: { teamId: team.id },
    });

    // Get updated team
    const updatedTeam = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member from team
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    // Fallback: If user not found in DB (webhook delay), create on the fly
    if (!user) {
      console.log("⚠️ [Team Members DELETE] User not found in DB, creating on the fly...");
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses[0]?.emailAddress || "";
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "User";
          
          user = await db.user.create({
            data: {
              clerkId: userId,
              email,
              name,
              image: clerkUser.imageUrl,
              emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
              // credits will default to 300 from schema
            }
          });
        }
      } catch (syncError) {
        console.error("❌ [Team Members DELETE] Failed to sync user from Clerk:", syncError);
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const memberId = searchParams.get("memberId");

    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: "Team ID and member ID are required" },
        { status: 400 }
      );
    }

    // Check if user owns the team
    const team = await db.team.findFirst({
      where: {
        id: teamId,
        ownerId: user.id,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Remove member from team
    await db.user.update({
      where: { id: memberId },
      data: { teamId: null },
    });

    // Get updated team
    const updatedTeam = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
