import type { GenerateTextRequest } from "@contentforge/shared";
import { LENGTH_TOKENS } from "@contentforge/shared";
import { getOpenAIClient } from "./openai-client";

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Write in a professional, authoritative tone suitable for business contexts.",
  casual: "Write in a friendly, conversational tone that feels approachable and relatable.",
  humorous: "Write with wit, humor, and lightheartedness. Include tasteful jokes where appropriate.",
  inspirational: "Write in a motivating, uplifting tone that inspires action and positive thinking.",
  educational: "Write in a clear, informative tone that teaches and explains concepts accessibly.",
};

const CONTENT_TYPE_INSTRUCTIONS: Record<string, string> = {
  POST: "Create a concise, engaging social media post. Include relevant hashtags at the end.",
  STORY: "Create compelling story content optimized for social media stories format. Keep it punchy and visual.",
  REEL: "Write a script for a short-form video reel with a strong hook, main content, and call-to-action.",
  VIDEO: "Write a detailed video script with a clear intro, main content sections, and an outro with CTA.",
  BLOG: "Write a well-structured blog post with headings (##), subheadings (###), and clear paragraphs.",
};

export interface TextGenerationResult {
  text: string;
  tokensUsed: number;
  cost: number;
}

export async function generateText(
  request: GenerateTextRequest
): Promise<TextGenerationResult> {
  const client = getOpenAIClient();
  const maxWords = LENGTH_TOKENS[request.length] ?? 500;

  const systemPrompt = `You are ContentForge AI, an expert content creator specializing in high-quality digital content.
Tone: ${TONE_INSTRUCTIONS[request.tone] ?? request.tone}
Format: Respond with clean, well-formatted markdown.`;

  const userPrompt = `Create ${request.contentType} content about the following topic:

"${request.prompt}"

Guidelines:
- ${CONTENT_TYPE_INSTRUCTIONS[request.contentType] ?? "Create engaging content."}
- Target length: approximately ${maxWords} words
- Use markdown formatting where appropriate`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxWords * 3,
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content ?? "";
  const tokensUsed = response.usage?.total_tokens ?? 0;

  // GPT-4o pricing (approximate): $5/1M input, $15/1M output
  const inputCost = ((response.usage?.prompt_tokens ?? 0) / 1_000_000) * 5;
  const outputCost = ((response.usage?.completion_tokens ?? 0) / 1_000_000) * 15;
  const cost = inputCost + outputCost;

  return { text, tokensUsed, cost };
}

