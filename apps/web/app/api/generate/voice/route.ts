import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { generateVoice } from "@contentforge/ai-services";
import { uploadBase64 } from "@/lib/r2";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(5000),
  voiceId: z.string(),
  modelId: z.string().optional(),
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

    const title = `Voice — ${data.text.substring(0, 50)}${data.text.length > 50 ? "…" : ""}`;
    const content = await prisma.content.create({
      data: { title, type: "POST", status: "draft", userId: user.id, projectId: data.projectId ?? null },
    });

    const result = await generateVoice(data as import("@contentforge/shared").GenerateVoiceRequest);

    // Upload audio to R2 (avoids storing large base64 in DB)
    const r2Url = await uploadBase64(result.audioBase64, "mp3", "audio/mpeg");
    // Fall back to data URI if R2 not configured
    const storedResult = r2Url ?? `data:audio/mpeg;base64,${result.audioBase64}`;
    // Return base64 to client regardless (needed for immediate playback)
    const clientAudio = result.audioBase64;

    const generation = await prisma.generation.create({
      data: {
        type: "VOICE",
        prompt: data.text,
        result: storedResult,
        metadata: {
          voiceId: data.voiceId,
          modelId: data.modelId,
          durationSeconds: result.durationSeconds,
          r2Stored: !!r2Url,
        },
        contentId: content.id,
        cost: result.cost,
      },
    });

    return NextResponse.json({
      generationId: generation.id,
      contentId: content.id,
      audioBase64: clientAudio,
      durationSeconds: result.durationSeconds,
      cost: result.cost,
    });
  } catch (error) {
    console.error("[POST /api/generate/voice]", error);
    if (error instanceof Error && error.message.includes("ELEVENLABS_API_KEY")) {
      return NextResponse.json({ error: error.message, code: "CONFIG_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
