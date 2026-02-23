import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { generateAvatar } from "@contentforge/ai-services";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(3000),
  avatarId: z.enum([
    "Anna_public_3_20240108",
    "Tyler_public_incasualsuit_20220721",
    "Daisy_public_inskirt_20220818",
    "Eric_public_pro2_20230608",
  ]),
  voiceId: z.string().min(1),
  dimension: z.enum(["16:9", "9:16", "1:1"]).optional(),
  projectId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: { id: user.id, email: user.email!, name: user.user_metadata?.name },
    });

    const title = `Avatar — ${data.text.substring(0, 50)}${data.text.length > 50 ? "…" : ""}`;
    const content = await prisma.content.create({
      data: { title, type: "VIDEO", status: "draft", userId: user.id, projectId: data.projectId ?? null },
    });

    const result = await generateAvatar(data as import("@contentforge/shared").GenerateAvatarRequest);

    const generation = await prisma.generation.create({
      data: {
        type: "AVATAR",
        prompt: data.text,
        result: result.videoId,
        metadata: {
          avatarId: data.avatarId,
          voiceId: data.voiceId,
          dimension: data.dimension ?? "16:9",
          videoId: result.videoId,
          status: result.status,
        },
        contentId: content.id,
        cost: result.cost,
      },
    });

    return NextResponse.json({
      generationId: generation.id,
      contentId: content.id,
      videoId: result.videoId,
      status: result.status,
      cost: result.cost,
    });
  } catch (error) {
    console.error("[POST /api/generate/avatar]", error);
    if (error instanceof Error && error.message.includes("HEYGEN_API_KEY")) {
      return NextResponse.json({ error: error.message, code: "CONFIG_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
