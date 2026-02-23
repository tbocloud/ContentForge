import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, ImageIcon, Mic, Video, User, ArrowRight } from "lucide-react";

const features = [
  {
    icon: FileText,
    color: "text-blue-400",
    bg: "bg-blue-900/50",
    title: "AI Text Generation",
    description: "Generate blogs, social posts, scripts, and stories with GPT-4o. Multiple tones, content types, and lengths.",
    badge: "Live",
    href: "/create/text",
  },
  {
    icon: ImageIcon,
    color: "text-purple-400",
    bg: "bg-purple-900/50",
    title: "AI Image Generation",
    description: "Create stunning HD visuals with DALL-E 3. Perfect for thumbnails, banners, social media, and marketing.",
    badge: "Live",
    href: "/create/image",
  },
  {
    icon: Mic,
    color: "text-green-400",
    bg: "bg-green-900/50",
    title: "AI Voice Generation",
    description: "Convert text to natural-sounding voiceovers powered by ElevenLabs. 8 professional voices, MP3 download.",
    badge: "Live",
    href: "/create/voice",
  },
  {
    icon: Video,
    color: "text-red-400",
    bg: "bg-red-900/50",
    title: "AI Video Generation",
    description: "Create short-form videos with Runway Gen-4. Landscape, portrait, 5–10 second cinematic clips.",
    badge: "Live",
    href: "/create/video",
  },
  {
    icon: User,
    color: "text-pink-400",
    bg: "bg-pink-900/50",
    title: "AI Avatar Videos",
    description: "Generate talking-head avatar videos with HeyGen. Choose from professional avatars and natural voices.",
    badge: "Live",
    href: "/create/avatar",
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
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-blue-900/50 text-blue-300 border-blue-700">
          Text · Image · Voice · Video · Avatar — All Live
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Create Premium Content
          <br />
          with AI — In Seconds
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          ContentForge AI transforms your ideas into polished blog posts, social
          media content, voiceovers, and videos. One platform, infinite
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
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-slate-400 text-lg">
            Five powerful AI tools — all live, all in one platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={`/signup`}>
              <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-500 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${feature.bg} rounded-lg`}>
                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                    </div>
                    <Badge className="bg-green-900/50 text-green-300 border-green-700">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-slate-400">ContentForge AI</span>
        </div>
        <p>Built with Next.js · OpenAI GPT-4o · DALL-E 3 · ElevenLabs · Runway Gen-4 · HeyGen</p>
      </footer>
    </div>
  );
}
