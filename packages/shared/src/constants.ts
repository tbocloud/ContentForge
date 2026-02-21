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
