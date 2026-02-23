// Text
export { generateText } from "./text-generation";
export type { TextGenerationResult } from "./text-generation";

// Image
export { generateImage } from "./image-generation";
export type { ImageGenerationResult } from "./image-generation";

// Voice
export { generateVoice } from "./voice-generation";
export type { VoiceGenerationResult } from "./voice-generation";

// Video
export { generateVideo, pollVideoStatus } from "./video-generation";
export type { VideoGenerationResult } from "./video-generation";

// OpenAI client
export { getOpenAIClient } from "./openai-client";
