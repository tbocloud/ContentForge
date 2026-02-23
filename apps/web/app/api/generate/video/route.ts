import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { generateVideo } from "@contentforge/ai-services";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(2000),
  model: z.enum(["gen3a_turbo", "gen4_turbo"]),
  ratio: z.enum(["1280:720", "720:1280", "1104:832", "832:1104"]),
  duration: z.literal(5).or(z.literal(10)),
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

    const title = `Video — ${data.prompt.substring(0, 50)}${data.prompt.length > 50 ? "…" : ""}`;
    const content = await prisma.content.create({
      data: { title, type: "VIDEO", status: "draft", userId: user.id, projectId: data.projectId ?? null },
    });

    const result = await generateVideo(data);

    const generation = await prisma.generation.create({
      data: {
        type: "VIDEO",
        prompt: data.prompt,
        result: result.taskId,
        metadata: { model: data.model, ratio: data.ratio, duration: data.duration, taskId: result.taskId, status: result.status },
        contentId: content.id,
        cost: result.cost,
      },
    });

    return NextResponse.json({
      generationId: generation.id,
      contentId: content.id,
      taskId: result.taskId,
      status: result.status,
      cost: result.cost,
    });
  } catch (error) {
    console.error("[POST /api/generate/video]", error);
    if (error instanceof Error && error.message.includes("RUNWAY_API_KEY")) {
      return NextResponse.json({ error: error.message, code: "CONFIG_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
