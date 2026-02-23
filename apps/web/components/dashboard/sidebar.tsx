"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Library,
  Settings,
  FileText,
  ImageIcon,
  Mic,
  Video,
  Sparkles,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/library", label: "Library", icon: Library },
];

const createNav = [
  { href: "/create/text", label: "Text", icon: FileText, active: true },
  { href: "/create/image", label: "Image", icon: ImageIcon, active: true },
  { href: "/create/voice", label: "Voice", icon: Mic, active: true },
  { href: "/create/video", label: "Video", icon: Video, active: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(true);

  return (
    <div className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-lg text-white">ContentForge</span>
      </div>
      <Separator className="bg-slate-800" />

      <nav className="flex-1 p-4 space-y-1">
        {mainNav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800",
                pathname === item.href && "bg-slate-800 text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}

        <Separator className="bg-slate-800 my-3" />

        <Collapsible open={createOpen} onOpenChange={setCreateOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="h-4 w-4" />
                Create
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  createOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 mt-1 space-y-1">
            {createNav.map((item) =>
              item.active ? (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800",
                      pathname === item.href && "bg-slate-800 text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sm text-slate-600 cursor-default"
                  disabled
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto text-xs text-slate-700">Soon</span>
                </Button>
              )
            )}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
