import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

// GET - Get user's team information
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            },
          },
        },
        ownedTeams: {
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
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has Ultra plan
    const hasUltraPlan = user.subscriptionPlan === "ultra";

    return NextResponse.json({
      team: user.team,
      ownedTeams: user.ownedTeams,
      canCreateTeam: hasUltraPlan,
      subscriptionPlan: user.subscriptionPlan,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new team (Ultra plan only)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has Ultra plan
    if (user.subscriptionPlan !== "ultra") {
      return NextResponse.json(
        { error: "Team support is only available for Ultra plan subscribers" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Create team
    const team = await db.team.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
        sharedCredits: 0,
      },
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
      team,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update team
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { teamId, name } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
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

    // Update team
    const updatedTeam = await db.team.update({
      where: { id: teamId },
      data: {
        name: name?.trim() || team.name,
      },
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
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete team
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
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

    // Remove all members from team
    await db.user.updateMany({
      where: { teamId: teamId },
      data: { teamId: null },
    });

    // Delete team
    await db.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
