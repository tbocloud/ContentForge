import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { generateImage } from "@contentforge/ai-services";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters").max(4000),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
  quality: z.enum(["standard", "hd"]),
  style: z.enum(["vivid", "natural"]),
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

    const title = `Image — ${data.prompt.substring(0, 50)}${data.prompt.length > 50 ? "…" : ""}`;
    const content = await prisma.content.create({
      data: { title, type: "POST", status: "draft", userId: user.id, projectId: data.projectId ?? null },
    });

    const result = await generateImage(data);

    const generation = await prisma.generation.create({
      data: {
        type: "IMAGE",
        prompt: data.prompt,
        result: result.imageUrl,
        metadata: { size: data.size, quality: data.quality, style: data.style, revisedPrompt: result.revisedPrompt },
        contentId: content.id,
        cost: result.cost,
      },
    });

    return NextResponse.json({
      generationId: generation.id,
      contentId: content.id,
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
      cost: result.cost,
    });
  } catch (error) {
    console.error("[POST /api/generate/image]", error);
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: error.message, code: "CONFIG_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
