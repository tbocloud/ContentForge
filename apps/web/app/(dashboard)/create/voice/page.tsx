"use client";

import { useState, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mic,
  Sparkles,
  Download,
  Loader2,
  RotateCcw,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { VOICE_LABELS } from "@contentforge/shared";
import type { VoiceId } from "@contentforge/shared";

const MAX_CHARS = 2500;

const formSchema = z.object({
  text: z
    .string()
    .min(10, "Please enter at least 10 characters of text")
    .max(MAX_CHARS, `Maximum ${MAX_CHARS} characters`),
  voiceId: z.string().min(1, "Please select a voice"),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationResult {
  audioBase64: string;
  durationSeconds: number;
  cost: number;
  generationId: string;
}

export default function VoiceGenerationPage() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const text = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
    },
  });

  const watchedText = text.watch("text") ?? "";
  const charCount = watchedText.length;

  async function onSubmit(data: FormData) {
    setIsGenerating(true);
    setResult(null);
    setIsPlaying(false);
    try {
      const response = await fetch("/api/generate/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        if (json.code === "CONFIG_ERROR") {
          toast.error(
            "ElevenLabs API key not configured. Add a valid key to .env.local"
          );
        } else {
          toast.error(json.error ?? "Voice generation failed. Please try again.");
        }
        return;
      }

      setResult(json);
      toast.success("Voice generated!");
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setIsGenerating(false);
    }
  }

  function getAudioSrc() {
    if (!result?.audioBase64) return "";
    return `data:audio/mpeg;base64,${result.audioBase64}`;
  }

  function togglePlayback() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function downloadAudio() {
    if (!result?.audioBase64) return;
    const link = document.createElement("a");
    link.href = getAudioSrc();
    link.download = "contentforge-voice.mp3";
    link.click();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-green-900/50 rounded-lg">
          <Mic className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Generation</h1>
          <p className="text-slate-400 text-sm">Powered by ElevenLabs</p>
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
              Enter text and select a voice to synthesize
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={text.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-text" className="text-slate-300">
                    Text to speak
                  </Label>
                  <span
                    className={`text-xs ${
                      charCount > MAX_CHARS * 0.9
                        ? "text-orange-400"
                        : "text-slate-500"
                    }`}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
                <Textarea
                  id="voice-text"
                  placeholder="e.g. Welcome to ContentForge, the ultimate AI-powered platform for creating stunning content..."
                  rows={7}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  {...text.register("text")}
                />
                {text.formState.errors.text && (
                  <p className="text-red-400 text-xs">
                    {text.formState.errors.text.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Voice</Label>
                <Select
                  defaultValue="pNInz6obpgDQGcFmaJgB"
                  onValueChange={(v) =>
                    text.setValue("voiceId", v as VoiceId)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(VOICE_LABELS).map(([id, label]) => (
                      <SelectItem
                        key={id}
                        value={id}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Pricing: </span>
                ~$0.30 per 1,000 characters (ElevenLabs Multilingual v2)
              </div>

              <Separator className="bg-slate-700" />

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synthesizing voice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Voice
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
                  Generated Audio
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your AI-generated voiceover will appear here
                </CardDescription>
              </div>
              {result && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={() => text.handleSubmit(onSubmit)()}
                    title="Regenerate"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={downloadAudio}
                    title="Download MP3"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full bg-slate-800 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-5">
                {/* Audio player */}
                <audio
                  ref={audioRef}
                  src={getAudioSrc()}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="bg-slate-800 rounded-xl p-6 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={togglePlayback}
                      className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 cursor-pointer"
                      size="icon"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </Button>
                    <div>
                      <p className="text-white font-medium">
                        {isPlaying ? "Playing..." : "Ready to play"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {result.durationSeconds > 0
                          ? `~${result.durationSeconds}s`
                          : "MP3 Audio"}
                      </p>
                    </div>
                  </div>
                  <audio
                    controls
                    src={getAudioSrc()}
                    className="w-full h-10"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>ElevenLabs Multilingual v2</span>
                  <span>Cost: ${result.cost.toFixed(5)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <Mic className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  Enter text and select a voice, then click &quot;Generate
                  Voice&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
