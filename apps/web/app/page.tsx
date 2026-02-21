import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, ImageIcon, Mic, Video, ArrowRight } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Text Generation",
    description: "Generate blogs, social posts, scripts, and stories with GPT-4o. Multiple tones and content types.",
    badge: "Live",
    live: true,
  },
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    description: "Create stunning visuals with DALL-E 3 HD. Perfect for thumbnails, banners, and social media.",
    badge: "Coming Soon",
    live: false,
  },
  {
    icon: Mic,
    title: "AI Voice Generation",
    description: "Convert text to natural-sounding voiceovers powered by ElevenLabs.",
    badge: "Coming Soon",
    live: false,
  },
  {
    icon: Video,
    title: "AI Video & Avatar",
    description: "Create short-form videos and talking avatars with Runway Gen-3 and HeyGen.",
    badge: "Coming Soon",
    live: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-xl">ContentForge AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-slate-300 hover:text-white cursor-pointer">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
            <Link href="/signup">
              Get Started Free
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-blue-900/50 text-blue-300 border-blue-700">
          Powered by GPT-4o
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Create Premium Content
          <br />
          with AI — In Seconds
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          ContentForge AI transforms your ideas into polished blog posts, social
          media content, voiceovers, and video scripts. One platform, infinite
          possibilities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 cursor-pointer">
            <Link href="/signup">
              Start Creating Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 cursor-pointer"
          >
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-slate-400 text-lg">
            One platform for all your AI content creation needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-slate-900/50 border-slate-700 hover:border-slate-500 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/50 rounded-lg">
                      <feature.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </div>
                  <Badge
                    className={
                      feature.live
                        ? "bg-green-900/50 text-green-300 border-green-700"
                        : "bg-slate-800 text-slate-400 border-slate-600"
                    }
                  >
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-slate-400">ContentForge AI</span>
        </div>
        <p>Built with Next.js, Supabase, and OpenAI GPT-4o</p>
      </footer>
    </div>
  );
}
