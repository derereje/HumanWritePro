import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";

const contactSchema = z.object({
  name: z.string().min(2, "Please provide your name.").max(120),
  // email is derived from the authenticated user; ignore any client-provided value
  message: z
    .string()
    .min(10, "Tell us a little more about how we can help.")
    .max(4000),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? undefined;

    const body = await request.json();
    const payload = contactSchema.parse(body);

    await db.contactMessage.create({
      data: {
        name: payload.name,
        email: userEmail ?? "",
        message: payload.message,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.flatten() }, { status: 400 });
    }

    console.error("[CONTACT_API]", error);
    return NextResponse.json({ success: false, error: "Unable to save your message right now." }, { status: 500 });
  }
}

