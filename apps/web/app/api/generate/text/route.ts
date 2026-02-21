import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { generateText } from "@contentforge/ai-services";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000),
  contentType: z.enum(["POST", "STORY", "REEL", "VIDEO", "BLOG"]),
  tone: z.enum([
    "professional",
    "casual",
    "humorous",
    "inspirational",
    "educational",
  ]),
  length: z.enum(["short", "medium", "long"]),
  projectId: z.string().optional(),
  contentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Ensure user exists in Prisma
    await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
      },
    });

    // Create or reuse a Content record
    let contentId = data.contentId;
    if (!contentId) {
      const truncated = data.prompt.substring(0, 50);
      const title = `${data.contentType} — ${truncated}${data.prompt.length > 50 ? "…" : ""}`;
      const content = await prisma.content.create({
        data: {
          title,
          type: data.contentType,
          status: "draft",
          userId: user.id,
          projectId: data.projectId ?? null,
        },
      });
      contentId = content.id;
    }

    // Call OpenAI
    const result = await generateText(data);

    // Save generation
    const generation = await prisma.generation.create({
      data: {
        type: "TEXT",
        prompt: data.prompt,
        result: result.text,
        metadata: {
          contentType: data.contentType,
          tone: data.tone,
          length: data.length,
          tokensUsed: result.tokensUsed,
          model: "gpt-4o",
        },
        contentId,
        cost: result.cost,
      },
    });

    return NextResponse.json({
      generationId: generation.id,
      contentId,
      result: result.text,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
    });
  } catch (error) {
    console.error("[POST /api/generate/text]", error);

    if (error instanceof Error) {
      if (
        error.message.includes("OPENAI_API_KEY") ||
        error.message.includes("not configured")
      ) {
        return NextResponse.json(
          { error: error.message, code: "CONFIG_ERROR" },
          { status: 500 }
        );
      }
      if (error.message.includes("429")) {
        return NextResponse.json(
          { error: "OpenAI rate limit reached. Please try again.", code: "RATE_LIMIT" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
