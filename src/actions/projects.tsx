"use server";

import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

interface CreateProjectData {
  imageUrl: string;
  imageKitId: string;
  filePath: string;
  name?: string;
}

export async function createProject(data: CreateProjectData) {
  try {
    const user = await requireAuth();

    const project = await db.project.create({
      data: {
        name: data.name ?? "Untitled Project",
        imageUrl: data.imageUrl,
        imageKitId: data.imageKitId,
        filePath: data.filePath,
        userId: user.id,
      },
    });

    return { success: true, project };
  } catch (error) {
    console.error("Project creation error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function getUserProjects() {
  try {
    const user = await requireAuth();

    const projects = await db.project.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, projects };
  } catch (error) {
    console.error("Projects fetch error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}


export async function deductCredits(
  creditsToDeduct: number,
  operation?: string,
) {
  try {
    // Input validation - prevent negative numbers or invalid inputs
    if (
      !creditsToDeduct ||
      creditsToDeduct <= 0 ||
      !Number.isInteger(creditsToDeduct)
    ) {
      return { success: false, error: "Invalid credit amount" };
    }

    const user = await requireAuth();

    // First check if user has enough credits
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    if (currentUser.credits < creditsToDeduct) {
      return { success: false, error: "Insufficient credits" };
    }

    // Deduct the specified amount of credits
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { credits: currentUser.credits - creditsToDeduct },
    });

    return { success: true, remainingCredits: updatedUser.credits };
  } catch (error) {
    console.error(
      `Credit deduction error${operation ? ` for ${operation}` : ""}:`,
      error,
    );
    return { success: false, error: "Failed to deduct credits" };
  }
}