import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (!historyId) {
      return NextResponse.json({ error: "History ID required" }, { status: 400 });
    }

    // Delete the history item (only if it belongs to the user)
    const deleted = await db.humanizerHistory.deleteMany({
      where: {
        id: historyId,
        userId: dbUser.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "History item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "History item deleted" });

  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
