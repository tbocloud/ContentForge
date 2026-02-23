import type { GenerateAvatarRequest } from "@contentforge/shared";

export interface AvatarGenerationResult {
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  cost: number;
}

export interface AvatarPollResult {
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
}

function getHeyGenKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key || key === "placeholder") {
    throw new Error(
      "HEYGEN_API_KEY is not configured. Add a valid key to .env.local"
    );
  }
  return key;
}

const HEYGEN_API = "https://api.heygen.com";

const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "1:1":  { width: 1080, height: 1080 },
};

export async function generateAvatar(
  request: GenerateAvatarRequest
): Promise<AvatarGenerationResult> {
  const apiKey = getHeyGenKey();
  const dimension = DIMENSION_MAP[request.dimension ?? "16:9"];

  const response = await fetch(`${HEYGEN_API}/v2/video/generate`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: request.avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: request.text,
            voice_id: request.voiceId,
            speed: 1.0,
          },
          background: {
            type: "color",
            value: "#0f172a",
          },
        },
      ],
      dimension,
      aspect_ratio: request.dimension ?? "16:9",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HeyGen API error: ${response.status} — ${err}`);
  }

  const data = (await response.json()) as { data: { video_id: string } };
  // HeyGen: ~$0.08/second, estimate ~30s per generation
  const cost = 0.08 * 30;

  return { videoId: data.data.video_id, status: "pending", cost };
}

export async function pollAvatarStatus(videoId: string): Promise<AvatarPollResult> {
  const apiKey = getHeyGenKey();

  const response = await fetch(
    `${HEYGEN_API}/v1/video_status.get?video_id=${videoId}`,
    { headers: { "X-Api-Key": apiKey } }
  );

  if (!response.ok) {
    throw new Error(`HeyGen poll error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: { status: string; video_url?: string };
  };

  const statusMap: Record<string, AvatarPollResult["status"]> = {
    pending:    "pending",
    processing: "processing",
    completed:  "completed",
    failed:     "failed",
  };

  return {
    status: statusMap[data.data.status] ?? "processing",
    videoUrl: data.data.video_url,
  };
}
