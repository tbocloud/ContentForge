"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  Sparkles,
  Download,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  VIDEO_MODEL_LABELS,
  VIDEO_RATIO_LABELS,
} from "@contentforge/shared";
import type { VideoModel, VideoRatio } from "@contentforge/shared";

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe the video (min 10 chars)")
    .max(2000),
  model: z.enum(["gen3a_turbo", "gen4_turbo"]),
  ratio: z.enum(["1280:720", "720:1280", "1104:832", "832:1104"]),
  duration: z.literal(5).or(z.literal(10)),
});

type FormData = z.infer<typeof formSchema>;

type PollStatus = "pending" | "processing" | "completed" | "failed";

interface GenerationState {
  taskId: string;
  generationId: string;
  status: PollStatus;
  videoUrl?: string;
  cost: number;
  progress: number;
}

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 60; // 5 minutes max

export default function VideoGenerationPage() {
  const [generation, setGeneration] = useState<GenerationState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "gen4_turbo",
      ratio: "1280:720",
      duration: 10,
    },
  });

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (taskId: string, generationId: string) => {
      if (pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        setGeneration((prev) =>
          prev ? { ...prev, status: "failed", progress: 0 } : null
        );
        toast.error("Video generation timed out. Please try again.");
        return;
      }

      pollCountRef.current += 1;

      try {
        const res = await fetch(
          `/api/generate/video/poll?taskId=${taskId}&generationId=${generationId}`
        );
        const json = await res.json();

        if (!res.ok) {
          if (json.code === "CONFIG_ERROR") {
            stopPolling();
            setGeneration((prev) =>
              prev ? { ...prev, status: "failed" } : null
            );
            toast.error(
              "Runway API key not configured. Add a valid key to .env.local"
            );
            return;
          }
          // keep polling on transient errors
        } else {
          const status: PollStatus = json.status;
          const progress = Math.min(
            95,
            Math.round((pollCountRef.current / MAX_POLLS) * 100)
          );

          setGeneration((prev) =>
            prev
              ? {
                  ...prev,
                  status,
                  videoUrl: json.videoUrl,
                  progress: status === "completed" ? 100 : progress,
                }
              : null
          );

          if (status === "completed") {
            stopPolling();
            toast.success("Video ready!");
            return;
          }
          if (status === "failed") {
            stopPolling();
            toast.error("Video generation failed. Please try again.");
            return;
          }
        }
      } catch {
        // network error — keep polling
      }

      pollTimerRef.current = setTimeout(
        () => pollStatus(taskId, generationId),
        POLL_INTERVAL_MS
      );
    },
    [stopPolling]
  );

  async function onSubmit(data: FormData) {
    stopPolling();
    pollCountRef.current = 0;
    setIsSubmitting(true);
    setGeneration(null);

    try {
      const response = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        if (json.code === "CONFIG_ERROR") {
          toast.error(
            "Runway API key not configured. Add a valid key to .env.local"
          );
        } else {
          toast.error(json.error ?? "Video generation failed. Please try again.");
        }
        return;
      }

      const newGen: GenerationState = {
        taskId: json.taskId,
        generationId: json.generationId,
        status: json.status,
        cost: json.cost,
        progress: 5,
      };
      setGeneration(newGen);
      toast.info("Video submitted — polling for completion...");

      pollTimerRef.current = setTimeout(
        () => pollStatus(json.taskId, json.generationId),
        POLL_INTERVAL_MS
      );
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
    link.download = "contentforge-video.mp4";
    link.target = "_blank";
    link.click();
  }

  const isPolling =
    generation?.status === "pending" || generation?.status === "processing";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-red-900/50 rounded-lg">
          <Video className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Video Generation</h1>
          <p className="text-slate-400 text-sm">Powered by Runway Gen-3/Gen-4</p>
        </div>
        <Badge className="ml-auto bg-green-900/50 text-green-300 border-green-700">
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Configure</CardTitle>
            <CardDescription className="text-slate-400">
              Describe the video you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-slate-300">
                  Video description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. A drone flying over a misty mountain range at sunrise, cinematic 4K footage with golden hour lighting..."
                  rows={5}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  {...form.register("prompt")}
                />
                {form.formState.errors.prompt && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.prompt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Model</Label>
                <Select
                  defaultValue="gen4_turbo"
                  onValueChange={(v) =>
                    form.setValue("model", v as VideoModel)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(VIDEO_MODEL_LABELS).map(([v, label]) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Aspect Ratio</Label>
                <Select
                  defaultValue="1280:720"
                  onValueChange={(v) =>
                    form.setValue("ratio", v as VideoRatio)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(VIDEO_RATIO_LABELS).map(([v, label]) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Duration</Label>
                <Select
                  defaultValue="10"
                  onValueChange={(v) =>
                    form.setValue("duration", Number(v) as 5 | 10)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem
                      value="5"
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      5 seconds (~$0.25)
                    </SelectItem>
                    <SelectItem
                      value="10"
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      10 seconds (~$0.50)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Note: </span>
                Runway videos take 1–3 minutes to generate. The page polls
                automatically every 5 seconds.
              </div>

              <Separator className="bg-slate-700" />

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 cursor-pointer"
                disabled={isSubmitting || isPolling}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting to Runway...
                  </>
                ) : isPolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating video...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
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
                <CardTitle className="text-white text-lg">
                  Generated Video
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your AI-generated video will appear here
                </CardDescription>
              </div>
              {generation?.status === "completed" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    title="Regenerate"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={downloadVideo}
                    title="Download MP4"
                  >
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
                    <Clock className="h-10 w-10 text-red-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">
                      {generation.status === "processing"
                        ? "Processing video..."
                        : "Queued for generation..."}
                    </p>
                    <p className="text-slate-400 text-sm">
                      This usually takes 1–3 minutes
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{generation.progress}%</span>
                  </div>
                  <Progress
                    value={generation.progress}
                    className="h-2 bg-slate-800"
                  />
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs font-medium mb-1">
                    TASK ID
                  </p>
                  <p className="text-slate-400 text-xs font-mono truncate">
                    {generation.taskId}
                  </p>
                </div>
              </div>
            ) : generation?.status === "completed" && generation.videoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Video generated successfully</span>
                </div>
                <video
                  src={generation.videoUrl}
                  controls
                  className="w-full rounded-lg border border-slate-700"
                  style={{ maxHeight: "400px" }}
                />
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Runway Gen-3/Gen-4</span>
                  <span>Cost: ${generation.cost.toFixed(4)}</span>
                </div>
              </div>
            ) : generation?.status === "failed" ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="p-4 bg-red-900/20 rounded-full">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium mb-1">
                    Generation Failed
                  </p>
                  <p className="text-slate-400 text-sm">
                    Runway could not process this prompt. Try rewording it.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                  onClick={() => setGeneration(null)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <Video className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  Fill out the form and click &quot;Generate Video&quot; to
                  start
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
