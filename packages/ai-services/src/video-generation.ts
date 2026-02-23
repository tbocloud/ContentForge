import type { GenerateVideoRequest } from "@contentforge/shared";

export interface VideoGenerationResult {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  cost: number;
}

function getRunwayKey(): string {
  const key = process.env.RUNWAY_API_KEY;
  if (!key || key === "placeholder") {
    throw new Error(
      "RUNWAY_API_KEY is not configured. Add a valid key to .env.local"
    );
  }
  return key;
}

// Runway Gen-3 pricing: ~$0.05/second
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

export async function generateVideo(
  request: GenerateVideoRequest
): Promise<VideoGenerationResult> {
  const apiKey = getRunwayKey();

  const response = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      promptText: request.prompt,
      model: request.model,
      ratio: request.ratio,
      duration: request.duration,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Runway API error: ${response.status} — ${err}`);
  }

  const data = await response.json() as { id: string; status: string };
  const cost = request.duration * 0.05;

  return {
    taskId: data.id,
    status: "pending",
    cost,
  };
}

export async function pollVideoStatus(taskId: string): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  progress?: number;
}> {
  const apiKey = getRunwayKey();

  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Runway-Version": "2024-11-06",
    },
  });

  if (!response.ok) {
    throw new Error(`Runway poll error: ${response.status}`);
  }

  const data = await response.json() as {
    status: string;
    output?: string[];
    progress?: number;
  };

  const statusMap: Record<string, "pending" | "processing" | "completed" | "failed"> = {
    PENDING: "pending",
    RUNNING: "processing",
    SUCCEEDED: "completed",
    FAILED: "failed",
    CANCELLED: "failed",
  };

  return {
    status: statusMap[data.status] ?? "processing",
    videoUrl: data.output?.[0],
    progress: data.progress,
  };
}
