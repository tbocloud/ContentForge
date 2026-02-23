"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User, Sparkles, Download, Loader2, Clock,
  CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  AVATAR_LABELS, AVATAR_VOICE_LABELS, AVATAR_DIMENSION_LABELS,
} from "@contentforge/shared";
import type { AvatarId, AvatarDimension } from "@contentforge/shared";

const MAX_CHARS = 3000;

const formSchema = z.object({
  text: z.string().min(10, "Please enter at least 10 characters").max(MAX_CHARS),
  avatarId: z.enum([
    "Anna_public_3_20240108",
    "Tyler_public_incasualsuit_20220721",
    "Daisy_public_inskirt_20220818",
    "Eric_public_pro2_20230608",
  ]),
  voiceId: z.string().min(1, "Please select a voice"),
  dimension: z.enum(["16:9", "9:16", "1:1"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

type PollStatus = "pending" | "processing" | "completed" | "failed";

interface GenerationState {
  videoId: string;
  generationId: string;
  status: PollStatus;
  videoUrl?: string;
  cost: number;
  progress: number;
}

const POLL_INTERVAL_MS = 8000;
const MAX_POLLS = 75; // 10 minutes max (HeyGen can be slow)

export default function AvatarGenerationPage() {
  const [generation, setGeneration] = useState<GenerationState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatarId: "Anna_public_3_20240108",
      voiceId: "2d5b0e6cf36f460aa7fc47e3eee4ba54",
      dimension: "16:9",
    },
  });

  const watchedText = form.watch("text") ?? "";

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (videoId: string, generationId: string) => {
      if (pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        setGeneration((prev) => prev ? { ...prev, status: "failed", progress: 0 } : null);
        toast.error("Avatar generation timed out. Please try again.");
        return;
      }

      pollCountRef.current += 1;

      try {
        const res = await fetch(
          `/api/generate/avatar/poll?videoId=${videoId}&generationId=${generationId}`
        );
        const json = await res.json();

        if (!res.ok) {
          if (json.code === "CONFIG_ERROR") {
            stopPolling();
            setGeneration((prev) => prev ? { ...prev, status: "failed" } : null);
            toast.error("HeyGen API key not configured. Add a valid key to .env.local");
            return;
          }
        } else {
          const status: PollStatus = json.status;
          const progress = Math.min(95, Math.round((pollCountRef.current / MAX_POLLS) * 100));

          setGeneration((prev) =>
            prev ? { ...prev, status, videoUrl: json.videoUrl, progress: status === "completed" ? 100 : progress } : null
          );

          if (status === "completed") { stopPolling(); toast.success("Avatar video ready!"); return; }
          if (status === "failed")    { stopPolling(); toast.error("Avatar generation failed."); return; }
        }
      } catch { /* keep polling on network error */ }

      pollTimerRef.current = setTimeout(() => pollStatus(videoId, generationId), POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  async function onSubmit(data: FormData) {
    stopPolling();
    pollCountRef.current = 0;
    setIsSubmitting(true);
    setGeneration(null);

    try {
      const response = await fetch("/api/generate/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        if (json.code === "CONFIG_ERROR") {
          toast.error("HeyGen API key not configured. Add a valid key to .env.local");
        } else {
          toast.error(json.error ?? "Avatar generation failed. Please try again.");
        }
        return;
      }

      setGeneration({
        videoId: json.videoId,
        generationId: json.generationId,
        status: json.status,
        cost: json.cost,
        progress: 5,
      });
      toast.info("Avatar submitted — HeyGen is rendering (3–10 minutes)...");
      pollTimerRef.current = setTimeout(() => pollStatus(json.videoId, json.generationId), POLL_INTERVAL_MS);
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function downloadVideo() {
    if (!generation?.videoUrl) return;
    const link = document.createElement("a");
    link.href = generation.videoUrl;
    link.download = "contentforge-avatar.mp4";
    link.target = "_blank";
    link.click();
  }

  const isPolling = generation?.status === "pending" || generation?.status === "processing";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-pink-900/50 rounded-lg">
          <User className="h-5 w-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Avatar</h1>
          <p className="text-slate-400 text-sm">Powered by HeyGen Creator</p>
        </div>
        <Badge className="ml-auto bg-green-900/50 text-green-300 border-green-700">Live</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Configure</CardTitle>
            <CardDescription className="text-slate-400">
              Write a script and choose your avatar + voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avatar-text" className="text-slate-300">Script</Label>
                  <span className={`text-xs ${watchedText.length > MAX_CHARS * 0.9 ? "text-orange-400" : "text-slate-500"}`}>
                    {watchedText.length}/{MAX_CHARS}
                  </span>
                </div>
                <Textarea
                  id="avatar-text"
                  placeholder="e.g. Welcome to ContentForge AI, the most powerful content creation platform..."
                  rows={6}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  {...form.register("text")}
                />
                {form.formState.errors.text && (
                  <p className="text-red-400 text-xs">{form.formState.errors.text.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Avatar</Label>
                <Select defaultValue="Anna_public_3_20240108" onValueChange={(v) => form.setValue("avatarId", v as AvatarId)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(AVATAR_LABELS).map(([id, label]) => (
                      <SelectItem key={id} value={id} className="text-slate-300 focus:bg-slate-700 focus:text-white">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Voice</Label>
                <Select defaultValue="2d5b0e6cf36f460aa7fc47e3eee4ba54" onValueChange={(v) => form.setValue("voiceId", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(AVATAR_VOICE_LABELS).map(([id, label]) => (
                      <SelectItem key={id} value={id} className="text-slate-300 focus:bg-slate-700 focus:text-white">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Aspect Ratio</Label>
                <Select defaultValue="16:9" onValueChange={(v) => form.setValue("dimension", v as AvatarDimension)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(AVATAR_DIMENSION_LABELS).map(([v, label]) => (
                      <SelectItem key={v} value={v} className="text-slate-300 focus:bg-slate-700 focus:text-white">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Note: </span>
                HeyGen renders take 3–10 minutes. The page polls every 8 seconds automatically.
                Cost ~$2.40 per video (~$0.08/sec × 30s).
              </div>

              <Separator className="bg-slate-700" />

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 cursor-pointer"
                disabled={isSubmitting || isPolling}
                size="lg"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting to HeyGen...</>
                ) : isPolling ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rendering avatar...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate Avatar Video</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Avatar Video</CardTitle>
                <CardDescription className="text-slate-400">Your AI talking avatar will appear here</CardDescription>
              </div>
              {generation?.status === "completed" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer" onClick={() => form.handleSubmit(onSubmit)()} title="Regenerate">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer" onClick={downloadVideo} title="Download MP4">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isPolling && generation ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="p-4 bg-slate-800 rounded-full">
                    <Clock className="h-10 w-10 text-pink-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">
                      {generation.status === "processing" ? "HeyGen is rendering your avatar..." : "Queued for rendering..."}
                    </p>
                    <p className="text-slate-400 text-sm">This usually takes 3–10 minutes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{generation.progress}%</span>
                  </div>
                  <Progress value={generation.progress} className="h-2 bg-slate-800" />
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs font-medium mb-1">VIDEO ID</p>
                  <p className="text-slate-400 text-xs font-mono truncate">{generation.videoId}</p>
                </div>
              </div>
            ) : generation?.status === "completed" && generation.videoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Avatar video ready</span>
                </div>
                <video src={generation.videoUrl} controls className="w-full rounded-lg border border-slate-700" style={{ maxHeight: "400px" }} />
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>HeyGen Creator</span>
                  <span>Cost: ${generation.cost.toFixed(2)}</span>
                </div>
              </div>
            ) : generation?.status === "failed" ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="p-4 bg-red-900/20 rounded-full">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">Generation Failed</p>
                  <p className="text-slate-400 text-sm">HeyGen could not process this request. Try again.</p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer" onClick={() => setGeneration(null)}>
                  <RotateCcw className="mr-2 h-4 w-4" />Try Again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <User className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  Write a script, pick an avatar and voice, then click &quot;Generate Avatar Video&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
