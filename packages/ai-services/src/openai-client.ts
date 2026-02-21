import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "sk-placeholder" || apiKey.startsWith("sk-placeholder")) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add a valid key to .env.local to use text generation."
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}
