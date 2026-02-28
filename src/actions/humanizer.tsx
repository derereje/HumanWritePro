"use server";

import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function getHumanizerHistory() {
  try {
    const user = await requireAuth();

    const history = await db.humanizerHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        originalText: true,
        humanizedText: true,
        preset: true,
        tokensUsed: true,
        aiScore: true,
        detectorResult: true,
        createdAt: true,
      },
    });

    return { success: true, history };
  } catch (error) {
    console.error("History fetch error:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

export async function saveHumanizerResult(data: {
  originalText: string;
  humanizedText: string;
  preset: string;
  tokensUsed: number;
  aiScore?: number;
  detectorResult?: any;
  metadata?: any;
}) {
  try {
    const user = await requireAuth();

    const result = await db.humanizerHistory.create({
      data: {
        originalText: data.originalText,
        humanizedText: data.humanizedText,
        preset: data.preset,
        tokensUsed: data.tokensUsed,
        aiScore: data.aiScore,
        detectorResult: data.detectorResult,
        metadata: data.metadata,
        userId: user.id,
      },
    });

    return { success: true, result };
  } catch (error) {
    console.error("Save humanizer result error:", error);
    return { success: false, error: "Failed to save result" };
  }
}

export async function deleteHumanizerHistory(id: string) {
  try {
    const user = await requireAuth();

    // Verify ownership
    const historyItem = await db.humanizerHistory.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!historyItem) {
      throw new Error("History item not found or unauthorized");
    }

    await db.humanizerHistory.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete history error:", error);
    return { success: false, error: "Failed to delete history item" };
  }
}

