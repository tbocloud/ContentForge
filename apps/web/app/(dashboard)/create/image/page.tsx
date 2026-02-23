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
  ImageIcon,
  Sparkles,
  Download,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  IMAGE_SIZE_LABELS,
  IMAGE_QUALITY_LABELS,
  IMAGE_STYLE_LABELS,
} from "@contentforge/shared";
import type { ImageSize, ImageQuality, ImageStyle } from "@contentforge/shared";

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, "Please describe the image you want (min 10 chars)")
    .max(4000),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
  quality: z.enum(["standard", "hd"]),
  style: z.enum(["vivid", "natural"]),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationResult {
  imageUrl: string;
  revisedPrompt: string;
  cost: number;
  generationId: string;
}

export default function ImageGenerationPage() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: "1792x1024",
      quality: "hd",
      style: "vivid",
    },
  });

  async function onSubmit(data: FormData) {
    setIsGenerating(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate/image", {
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
        } else if (json.code === "CONTENT_POLICY") {
          toast.error("Prompt rejected by content policy. Please revise it.");
        } else {
          toast.error(json.error ?? "Image generation failed. Please try again.");
        }
        return;
      }

      setResult(json);
      toast.success("Image generated!");
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadImage() {
    if (!result?.imageUrl) return;
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = "contentforge-image.png";
    link.target = "_blank";
    link.click();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-900/50 rounded-lg">
          <ImageIcon className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Image Generation</h1>
          <p className="text-slate-400 text-sm">Powered by OpenAI DALL-E 3</p>
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
              Describe the image you want to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-slate-300">
                  Image description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. A futuristic cityscape at sunset with neon lights reflecting on rain-soaked streets, cinematic style..."
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
                <Label className="text-slate-300">Size</Label>
                <Select
                  defaultValue="1792x1024"
                  onValueChange={(v) =>
                    form.setValue("size", v as ImageSize)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(IMAGE_SIZE_LABELS).map(([v, label]) => (
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
                <Label className="text-slate-300">Quality</Label>
                <Select
                  defaultValue="hd"
                  onValueChange={(v) =>
                    form.setValue("quality", v as ImageQuality)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(IMAGE_QUALITY_LABELS).map(([v, label]) => (
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
                <Label className="text-slate-300">Style</Label>
                <Select
                  defaultValue="vivid"
                  onValueChange={(v) =>
                    form.setValue("style", v as ImageStyle)
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(IMAGE_STYLE_LABELS).map(([v, label]) => (
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
                className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with DALL-E 3...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
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
                  Generated Image
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your AI-generated image will appear here
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
                    onClick={downloadImage}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={downloadImage}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-72 w-full bg-slate-800 rounded-lg" />
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.imageUrl}
                  alt="AI Generated"
                  className="w-full rounded-lg border border-slate-700"
                />
                {result.revisedPrompt && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs font-medium mb-1">
                      DALL-E revised prompt
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {result.revisedPrompt}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>DALL-E 3</span>
                  <span>Cost: ${result.cost.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 gap-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <ImageIcon className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  Fill out the form and click &quot;Generate Image&quot; to create your
                  visual
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
