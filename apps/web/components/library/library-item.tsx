"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ImageIcon, Mic, Video, User, Clock, Copy, Check, Zap, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type GenType = "TEXT" | "IMAGE" | "VOICE" | "VIDEO" | "AVATAR";

interface LibraryItemProps {
  item: {
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: Date;
    _count: { generations: number };
    generations: {
      id: string;
      type: string;
      result: string | null;
      createdAt: Date;
    }[];
  };
}

const TYPE_META: Record<GenType, { icon: React.ElementType; color: string; label: string }> = {
  TEXT:   { icon: FileText,  color: "text-blue-400",   label: "Text"   },
  IMAGE:  { icon: ImageIcon, color: "text-purple-400", label: "Image"  },
  VOICE:  { icon: Mic,       color: "text-green-400",  label: "Voice"  },
  VIDEO:  { icon: Video,     color: "text-red-400",    label: "Video"  },
  AVATAR: { icon: User,      color: "text-pink-400",   label: "Avatar" },
};

export function LibraryItem({ item }: LibraryItemProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gen = item.generations[0];
  const genType = (gen?.type ?? "TEXT") as GenType;
  const result = gen?.result ?? "";
  const meta = TYPE_META[genType] ?? TYPE_META.TEXT;
  const Icon = meta.icon;

  const isImage = genType === "IMAGE";
  const isVoice = genType === "VOICE";
  const isVideo = genType === "VIDEO" || genType === "AVATAR";
  const isText  = genType === "TEXT";

  async function copyText() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = isVoice ? "voice.mp3" : isVideo ? "video.mp4" : "image.png";
    link.target = "_blank";
    link.click();
  }

  // Card preview content
  function Preview() {
    if (isImage && result) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result}
          alt={item.title}
          className="w-full h-28 object-cover rounded-md border border-slate-700"
        />
      );
    }
    if (isVoice && result) {
      return (
        <div className="flex items-center gap-2 bg-slate-800 rounded-md p-2">
          <Mic className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 truncate">Audio ready — click to play</span>
        </div>
      );
    }
    if (isVideo && result) {
      return (
        <div className="flex items-center gap-2 bg-slate-800 rounded-md p-2">
          <Video className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 truncate">Video ready — click to view</span>
        </div>
      );
    }
    if (isText && result) {
      return (
        <p className="text-xs text-slate-500 line-clamp-2">
          {result.replace(/[#*_`]/g, "").substring(0, 120)}...
        </p>
      );
    }
    return <p className="text-xs text-slate-600 italic">No content yet</p>;
  }

  return (
    <>
      <Card
        className="bg-slate-900 border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={`h-4 w-4 ${meta.color} flex-shrink-0`} />
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
            </div>
            <Badge className="bg-slate-800 text-slate-300 border-slate-600 text-xs flex-shrink-0">
              {meta.label}
            </Badge>
          </div>

          <Preview />

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {item._count.generations} generation{item._count.generations !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-white flex items-center gap-2">
                <Icon className={`h-4 w-4 ${meta.color}`} />
                {item.title}
              </DialogTitle>
              <div className="flex gap-2">
                {isText && result && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={copyText}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
                {(isImage || isVoice || isVideo) && result && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                    onClick={download}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-2">
            {isText && result ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : isImage && result ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result}
                  alt={item.title}
                  className="w-full rounded-lg border border-slate-700"
                />
              </div>
            ) : isVoice && result ? (
              <div className="space-y-3">
                <div className="bg-slate-800 rounded-xl p-4">
                  <audio
                    controls
                    src={result}
                    className="w-full"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            ) : isVideo && result ? (
              <div className="space-y-3">
                <video
                  src={result}
                  controls
                  className="w-full rounded-lg border border-slate-700"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No generated content yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
