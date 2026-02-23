"use client";

import { useState } from "react";
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
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  CONTENT_TYPE_LABELS,
  TONE_LABELS,
  LENGTH_LABELS,
} from "@contentforge/shared";
import type { ContentType, ToneType, LengthType } from "@contentforge/shared";

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe what you want to create (min 10 chars)"),
  contentType: z.enum(["POST", "STORY", "REEL", "VIDEO", "BLOG"]),
  tone: z.enum([
    "professional",
    "casual",
    "humorous",
    "inspirational",
    "educational",
  ]),
  length: z.enum(["short", "medium", "long"]),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationResult {
  result: string;
  tokensUsed: number;
  cost: number;
  generationId: string;
}

export default function TextGenerationPage() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "POST",
      tone: "professional",
      length: "long",
    },
  });

  async function onSubmit(data: FormData) {
    setIsGenerating(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        if (json.code === "CONFIG_ERROR") {
          toast.error(
            "OpenAI API key not configured. Add a valid key to .env.local"
          );
        } else if (json.code === "RATE_LIMIT") {
          toast.error("Rate limit reached. Please wait a moment.");
        } else {
          toast.error(json.error ?? "Generation failed. Please try again.");
        }
        return;
      }

      setResult(json);
      toast.success("Content generated!");
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyToClipboard() {
    if (!result) return;
    await navigator.clipboard.writeText(result.result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-900/50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Text Generation</h1>
          <p className="text-slate-400 text-sm">Powered by OpenAI GPT-4o</p>
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
              Tell AI what you want to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-slate-300">
                  What do you want to create?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. Write a post about the benefits of morning routines for entrepreneurs..."
                  rows={4}
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
                <Label className="text-slate-300">Content Type</Label>
                <Select
                  defaultValue="POST"
                  onValueChange={(v) =>
                    form.setValue("contentType", v as ContentType)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(CONTENT_TYPE_LABELS).map(([v, label]) => (
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
                <Label className="text-slate-300">Tone</Label>
                <Select
                  defaultValue="professional"
                  onValueChange={(v) => form.setValue("tone", v as ToneType)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(TONE_LABELS).map(([v, label]) => (
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
                <Label className="text-slate-300">Length</Label>
                <Select
                  defaultValue="long"
                  onValueChange={(v) => form.setValue("length", v as LengthType)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(LENGTH_LABELS).map(([v, label]) => (
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

              <Separator className="bg-slate-700" />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with GPT-4o...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
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
                  Generated Content
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your AI-generated content will appear here
                </CardDescription>
              </div>
              {result && (
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
                    onClick={copyToClipboard}
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 bg-slate-800 ${i % 3 === 2 ? "w-3/4" : "w-full"}`}
                  />
                ))}
              </div>
            ) : result ? (
              <div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 min-h-[300px] overflow-auto">
                  <ReactMarkdown>{result.result}</ReactMarkdown>
                </div>
                <Separator className="bg-slate-700 my-4" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{result.tokensUsed.toLocaleString()} tokens</span>
                  <span>Cost: ${result.cost.toFixed(5)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <Sparkles className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  Fill out the form and click &quot;Generate Content&quot; to see the magic
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
