export type ContentType = "POST" | "STORY" | "REEL" | "VIDEO" | "BLOG";
export type GenerationType = "TEXT" | "IMAGE" | "VIDEO" | "VOICE" | "AVATAR";
export type ContentStatus = "draft" | "published" | "archived";

export type ToneType =
  | "professional"
  | "casual"
  | "humorous"
  | "inspirational"
  | "educational";

export type LengthType = "short" | "medium" | "long";

// ─── Text ────────────────────────────────────────────────────────────────────
export interface GenerateTextRequest {
  prompt: string;
  contentType: ContentType;
  tone: ToneType;
  length: LengthType;
  projectId?: string;
  contentId?: string;
}

export interface GenerateTextResponse {
  generationId: string;
  contentId: string;
  result: string;
  tokensUsed: number;
  cost: number;
}

// ─── Image ───────────────────────────────────────────────────────────────────
export type ImageSize =
  | "1024x1024"
  | "1792x1024"
  | "1024x1792";

export type ImageQuality = "standard" | "hd";
export type ImageStyle = "vivid" | "natural";

export interface GenerateImageRequest {
  prompt: string;
  size: ImageSize;
  quality: ImageQuality;
  style: ImageStyle;
  projectId?: string;
}

export interface GenerateImageResponse {
  generationId: string;
  contentId: string;
  imageUrl: string;
  revisedPrompt: string;
  cost: number;
}

// ─── Voice ───────────────────────────────────────────────────────────────────
export type VoiceId =
  | "21m00Tcm4TlvDq8ikWAM"   // Rachel — calm, professional
  | "AZnzlk1XvdvUeBnXmlld"   // Domi — strong, confident
  | "EXAVITQu4vr4xnSDxMaL"   // Bella — soft, pleasant
  | "ErXwobaYiN019PkySvjV"   // Antoni — well-rounded
  | "MF3mGyEYCl7XYWbV9V6O"   // Elli — young, energetic
  | "TxGEqnHWrfWFTfGW9XjX"   // Josh — deep, warm
  | "VR6AewLTigWG4xSOukaG"   // Arnold — crisp, authoritative
  | "pNInz6obpgDQGcFmaJgB";  // Adam — deep, narrative

export interface GenerateVoiceRequest {
  text: string;
  voiceId: VoiceId;
  modelId?: string;
  projectId?: string;
}

export interface GenerateVoiceResponse {
  generationId: string;
  contentId: string;
  audioBase64: string;
  durationSeconds: number;
  cost: number;
}

// ─── Video ───────────────────────────────────────────────────────────────────
export type VideoModel = "gen3a_turbo" | "gen4_turbo";
export type VideoRatio = "1280:720" | "720:1280" | "1104:832" | "832:1104";

export interface GenerateVideoRequest {
  prompt: string;
  model: VideoModel;
  ratio: VideoRatio;
  duration: 5 | 10;
  projectId?: string;
}

export interface GenerateVideoResponse {
  generationId: string;
  contentId: string;
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  cost: number;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export type AvatarId =
  | "Anna_public_3_20240108"
  | "Tyler_public_incasualsuit_20220721"
  | "Daisy_public_inskirt_20220818"
  | "Eric_public_pro2_20230608";

export type AvatarDimension = "16:9" | "9:16" | "1:1";

export interface GenerateAvatarRequest {
  text: string;
  avatarId: AvatarId;
  voiceId: string;
  dimension?: AvatarDimension;
  projectId?: string;
}

export interface GenerateAvatarResponse {
  generationId: string;
  contentId: string;
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  cost: number;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalContent: number;
  totalTokensUsed: number;
  totalProjects: number;
  recentContent: ContentSummary[];
}

export interface ContentSummary {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  generationsCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}
