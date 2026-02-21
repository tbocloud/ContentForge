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
import { FileText, Clock, Copy, Check, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
      result: string | null;
      createdAt: Date;
    }[];
  };
}

export function LibraryItem({ item }: LibraryItemProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const latestResult = item.generations[0]?.result ?? "";

  async function copy() {
    await navigator.clipboard.writeText(latestResult);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
              <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
            </div>
            <Badge className="bg-slate-800 text-slate-300 border-slate-600 text-xs flex-shrink-0">
              {item.type}
            </Badge>
          </div>
          {latestResult && (
            <p className="text-xs text-slate-500 line-clamp-2">
              {latestResult.replace(/[#*_`]/g, "").substring(0, 100)}...
            </p>
          )}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-white">{item.title}</DialogTitle>
              {latestResult && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 cursor-pointer"
                  onClick={copy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </DialogHeader>
          {latestResult ? (
            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              <ReactMarkdown>{latestResult}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No generated content yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
