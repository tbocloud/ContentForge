import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { pollAvatarStatus } from "@contentforge/ai-services";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    const generationId = searchParams.get("generationId");

    if (!videoId) {
      return NextResponse.json({ error: "videoId is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const status = await pollAvatarStatus(videoId);

    if (generationId && status.status === "completed" && status.videoUrl) {
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          result: status.videoUrl,
          metadata: { videoId, status: status.status, videoUrl: status.videoUrl },
        },
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("[GET /api/generate/avatar/poll]", error);
    if (error instanceof Error && error.message.includes("HEYGEN_API_KEY")) {
      return NextResponse.json({ error: error.message, code: "CONFIG_ERROR" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
