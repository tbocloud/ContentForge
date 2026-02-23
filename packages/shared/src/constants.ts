export const CONTENT_TYPE_LABELS: Record<string, string> = {
  POST: "Social Post",
  STORY: "Story",
  REEL: "Reel Script",
  VIDEO: "Video Script",
  BLOG: "Blog Post",
};

export const TONE_LABELS: Record<string, string> = {
  professional: "Professional",
  casual: "Casual",
  humorous: "Humorous",
  inspirational: "Inspirational",
  educational: "Educational",
};

export const LENGTH_LABELS: Record<string, string> = {
  short: "Short (100–200 words)",
  medium: "Medium (300–500 words)",
  long: "Long (700–1000 words)",
};

export const LENGTH_TOKENS: Record<string, number> = {
  short: 200,
  medium: 500,
  long: 1000,
};

export const IMAGE_SIZE_LABELS: Record<string, string> = {
  "1024x1024": "Square (1024×1024)",
  "1792x1024": "Landscape (1792×1024)",
  "1024x1792": "Portrait (1024×1792)",
};

export const IMAGE_QUALITY_LABELS: Record<string, string> = {
  standard: "Standard",
  hd: "HD — Higher detail",
};

export const IMAGE_STYLE_LABELS: Record<string, string> = {
  vivid: "Vivid — Hyper-real & dramatic",
  natural: "Natural — Less dramatic",
};

export const VOICE_LABELS: Record<string, string> = {
  "21m00Tcm4TlvDq8ikWAM": "Rachel — Calm, Professional",
  AZnzlk1XvdvUeBnXmlld: "Domi — Strong, Confident",
  EXAVITQu4vr4xnSDxMaL: "Bella — Soft, Pleasant",
  ErXwobaYiN019PkySvjV: "Antoni — Well-rounded",
  MF3mGyEYCl7XYWbV9V6O: "Elli — Young, Energetic",
  TxGEqnHWrfWFTfGW9XjX: "Josh — Deep, Warm",
  VR6AewLTigWG4xSOukaG: "Arnold — Crisp, Authoritative",
  pNInz6obpgDQGcFmaJgB: "Adam — Deep, Narrative",
};

export const VIDEO_RATIO_LABELS: Record<string, string> = {
  "1280:720": "Landscape 16:9",
  "720:1280": "Portrait 9:16 (Reels)",
  "1104:832": "Landscape 4:3",
  "832:1104": "Portrait 3:4",
};

export const VIDEO_MODEL_LABELS: Record<string, string> = {
  gen3a_turbo: "Gen-3 Alpha Turbo — Fast",
  gen4_turbo: "Gen-4 Turbo — Best quality",
};

export const AVATAR_LABELS: Record<string, string> = {
  "Anna_public_3_20240108":          "Anna — Professional Female",
  "Tyler_public_incasualsuit_20220721": "Tyler — Casual Male",
  "Daisy_public_inskirt_20220818":   "Daisy — Casual Female",
  "Eric_public_pro2_20230608":       "Eric — Professional Male",
};

export const AVATAR_VOICE_LABELS: Record<string, string> = {
  "2d5b0e6cf36f460aa7fc47e3eee4ba54": "Natalie — Warm Female",
  "1bd001e7e50f421d891986aad5158bc8": "Josh — Deep Male",
  "d7bbcdd6aad34a29b32d8d96fbaa4f7e": "Angela — Clear Female",
  "c1abd502f87c4572b2a80b2047e379d4": "David — Professional Male",
};

export const AVATAR_DIMENSION_LABELS: Record<string, string> = {
  "16:9": "Landscape 16:9 (1280×720)",
  "9:16": "Portrait 9:16 (720×1280)",
  "1:1":  "Square 1:1 (1080×1080)",
};
