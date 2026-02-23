import type { GenerateVoiceRequest } from "@contentforge/shared";

export interface VoiceGenerationResult {
  audioBase64: string;
  durationSeconds: number;
  cost: number;
}

function getElevenLabsKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || key === "placeholder") {
    throw new Error(
      "ELEVENLABS_API_KEY is not configured. Add a valid key to .env.local"
    );
  }
  return key;
}

export async function generateVoice(
  request: GenerateVoiceRequest
): Promise<VoiceGenerationResult> {
  const apiKey = getElevenLabsKey();
  const voiceId = request.voiceId;
  const modelId = request.modelId ?? "eleven_multilingual_v2";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: request.text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} — ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

  // Estimate duration: ~150 chars/second of speech
  const durationSeconds = Math.ceil(request.text.length / 150);

  // ElevenLabs Creator plan: ~$0.30/1000 characters
  const cost = (request.text.length / 1000) * 0.3;

  return { audioBase64, durationSeconds, cost };
}
