import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@contentforge/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Mic,
  Video,
  User,
  Zap,
  FolderOpen,
  PlusCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getStats(userId: string) {
  const [totalContent, totalProjects, recentContent, genAggregate] =
    await Promise.all([
      prisma.content.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.content.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { generations: true } },
          generations: { orderBy: { createdAt: "desc" }, take: 1, select: { type: true } },
        },
      }),
      prisma.generation.aggregate({
        where: { content: { userId } },
        _sum: { cost: true },
        _count: true,
      }),
    ]);
  return { totalContent, totalProjects, recentContent, genAggregate };
}

const GEN_ICON: Record<string, React.ElementType> = {
  TEXT:   FileText,
  IMAGE:  ImageIcon,
  VOICE:  Mic,
  VIDEO:  Video,
  AVATAR: User,
};
const GEN_COLOR: Record<string, string> = {
  TEXT:   "text-blue-400",
  IMAGE:  "text-purple-400",
  VOICE:  "text-green-400",
  VIDEO:  "text-red-400",
  AVATAR: "text-pink-400",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    await prisma.user.upsert({
      where: { email: user.email! },
      update: {},
      create: { id: user.id, email: user.email!, name: user.user_metadata?.name },
    });
  } catch {
    // Ignore — DB may not be connected yet
  }

  type StatsType = Awaited<ReturnType<typeof getStats>>;
  let stats: StatsType | null = null;

  try {
    stats = await getStats(user.id);
  } catch {
    // DB not connected — show zeros
  }

  const firstName = (user.user_metadata?.name as string | undefined)?.split(" ")[0] ?? "Creator";
  const totalCost = stats?.genAggregate._sum.cost ?? 0;

  const statCards = [
    { label: "Total Content",   value: stats?.totalContent ?? 0,          icon: FileText,   color: "text-blue-400"   },
    { label: "Generations Run", value: stats?.genAggregate._count ?? 0,   icon: Zap,        color: "text-yellow-400" },
    { label: "Projects",        value: stats?.totalProjects ?? 0,          icon: FolderOpen, color: "text-green-400"  },
    { label: "API Cost",        value: `$${totalCost.toFixed(4)}`,         icon: DollarSign, color: "text-purple-400" },
  ];

  const quickActions = [
    { href: "/create/text",   label: "Write Text",   icon: FileText,  color: "text-blue-400",   border: "hover:border-blue-600"   },
    { href: "/create/image",  label: "Create Image", icon: ImageIcon, color: "text-purple-400", border: "hover:border-purple-600" },
    { href: "/create/voice",  label: "Voice Over",   icon: Mic,       color: "text-green-400",  border: "hover:border-green-600"  },
    { href: "/create/video",  label: "Make Video",   icon: Video,     color: "text-red-400",    border: "hover:border-red-600"    },
    { href: "/create/avatar", label: "AI Avatar",    icon: User,      color: "text-pink-400",   border: "hover:border-pink-600"   },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
        <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Create */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Create</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className={`bg-slate-900 border-slate-700 ${action.border} transition-colors cursor-pointer`}>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <span className="text-sm font-medium text-white text-center">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Content</h2>
          <Link href="/library">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white cursor-pointer">
              View all
            </Button>
          </Link>
        </div>
        {(stats?.recentContent ?? []).length === 0 ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <PlusCircle className="h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No content yet. Create your first piece!</p>
              <Link href="/create/text">
                <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Create Content</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {(stats?.recentContent ?? []).map((content) => {
              const genType = content.generations[0]?.type ?? "TEXT";
              const Icon = GEN_ICON[genType] ?? FileText;
              const iconColor = GEN_COLOR[genType] ?? "text-blue-400";
              return (
                <Card key={content.id} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-medium text-white">{content.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(content.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-800 text-slate-300 border-slate-600 text-xs">{genType}</Badge>
                      <Badge className="bg-slate-800 text-slate-400 border-slate-600 text-xs">
                        {content._count.generations} gen
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
