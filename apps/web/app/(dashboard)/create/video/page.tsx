import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, ArrowLeft } from "lucide-react";

export default function VideoGenerationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white mb-6 cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-6 text-center">
          <div className="p-6 bg-slate-800/50 rounded-full">
            <Video className="h-16 w-16 text-slate-600" />
          </div>
          <div>
            <Badge className="mb-3 bg-orange-900/50 text-orange-300 border-orange-700">
              Coming Soon
            </Badge>
            <h1 className="text-2xl font-bold text-white mb-3">
              AI Video & Avatar Generation
            </h1>
            <p className="text-slate-400 max-w-md">
              Create short-form video content and talking avatars with Runway
              Gen-3 and HeyGen. Turn scripts into professional videos instantly.
            </p>
          </div>
          <Link href="/create/text">
            <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Try Text Generation Instead
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
