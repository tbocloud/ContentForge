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
