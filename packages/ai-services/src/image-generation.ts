import type { GenerateImageRequest, GenerateImageResponse } from "@contentforge/shared";
import { getOpenAIClient } from "./openai-client";

// DALL-E 3 HD pricing: $0.080/image standard, $0.120/image HD
const IMAGE_COST: Record<string, Record<string, number>> = {
  standard: {
    "1024x1024": 0.04,
    "1792x1024": 0.08,
    "1024x1792": 0.08,
  },
  hd: {
    "1024x1024": 0.08,
    "1792x1024": 0.12,
    "1024x1792": 0.12,
  },
};

export interface ImageGenerationResult {
  imageUrl: string;
  revisedPrompt: string;
  cost: number;
}

export async function generateImage(
  request: GenerateImageRequest
): Promise<ImageGenerationResult> {
  const client = getOpenAIClient();

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: request.prompt,
    size: request.size,
    quality: request.quality,
    style: request.style,
    n: 1,
  });

  const image = response.data?.[0];
  if (!image?.url) {
    throw new Error("No image URL returned from DALL-E 3");
  }

  const cost = IMAGE_COST[request.quality]?.[request.size] ?? 0.08;

  return {
    imageUrl: image.url,
    revisedPrompt: image.revised_prompt ?? request.prompt,
    cost,
  };
}
