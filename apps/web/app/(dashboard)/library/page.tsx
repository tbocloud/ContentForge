import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { Card, CardContent } from "@/components/ui/card";
import { Library, FileText } from "lucide-react";
import { LibraryItem } from "@/components/library/library-item";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getContent(userId: string, typeFilter?: string) {
  return prisma.content.findMany({
    where: {
      userId,
      ...(typeFilter && typeFilter !== "ALL"
        ? { type: typeFilter as "POST" | "STORY" | "REEL" | "VIDEO" | "BLOG" }
        : {}),
    },
    include: {
      generations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, result: true, createdAt: true },
      },
      _count: { select: { generations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;

  let content: Awaited<ReturnType<typeof getContent>> = [];
  try {
    content = await getContent(user.id, params.type);
  } catch {
    // DB not connected
  }

  const types = ["ALL", "POST", "STORY", "REEL", "VIDEO", "BLOG"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Library className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Content Library</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {content.length} piece{content.length !== 1 ? "s" : ""} of content
          </p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <Link key={t} href={t === "ALL" ? "/library" : `/library?type=${t}`}>
            <Button
              variant="outline"
              size="sm"
              className={
                (params.type === t || (!params.type && t === "ALL"))
                  ? "border-blue-600 text-blue-400 bg-blue-900/20 cursor-pointer"
                  : "border-slate-600 text-slate-400 hover:bg-slate-800 cursor-pointer"
              }
            >
              {t === "ALL" ? "All" : t}
            </Button>
          </Link>
        ))}
      </div>

      {content.length === 0 ? (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText className="h-10 w-10 text-slate-600" />
            <p className="text-slate-400">No content found.</p>
            <Link href="/create/text">
              <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Create Content
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {content.map((item) => (
            <LibraryItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
