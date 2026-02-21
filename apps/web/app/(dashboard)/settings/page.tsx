import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Settings, User, Key } from "lucide-react";

function ApiKeyStatus({ label, value }: { label: string; value: string }) {
  const isPlaceholder =
    !value ||
    value.includes("placeholder") ||
    value.includes("your_") ||
    value === "sk-placeholder" ||
    value === "sk-ant-placeholder";

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-slate-500" />
        <span className="text-slate-300 text-sm">{label}</span>
      </div>
      {isPlaceholder ? (
        <Badge className="bg-red-900/30 text-red-400 border-red-800 gap-1">
          <XCircle className="h-3 w-3" />
          Not configured
        </Badge>
      ) : (
        <Badge className="bg-green-900/30 text-green-400 border-green-800 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Configured
        </Badge>
      )}
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const apiKeys = [
    { label: "OpenAI API Key", value: process.env.OPENAI_API_KEY ?? "" },
    { label: "Supabase URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "" },
    { label: "Anthropic API Key", value: process.env.ANTHROPIC_API_KEY ?? "" },
    { label: "ElevenLabs API Key", value: process.env.ELEVENLABS_API_KEY ?? "" },
    { label: "Runway API Key", value: process.env.RUNWAY_API_KEY ?? "" },
    { label: "HeyGen API Key", value: process.env.HEYGEN_API_KEY ?? "" },
    { label: "Cloudflare R2 Endpoint", value: process.env.R2_ENDPOINT ?? "" },
  ];

  const displayName: string =
    (user.user_metadata?.name as string | undefined) ?? "—";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Account */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Email", value: user.email ?? "—" },
            { label: "Name", value: displayName },
            { label: "User ID", value: user.id, mono: true },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span
                className={
                  row.mono
                    ? "text-slate-500 font-mono text-xs"
                    : "text-white"
                }
              >
                {row.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            API Key Status
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure these in <code className="text-slate-300 bg-slate-800 px-1 rounded text-xs">apps/web/.env.local</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-800">
            {apiKeys.map((key) => (
              <ApiKeyStatus key={key.label} label={key.label} value={key.value} />
            ))}
          </div>
          <Separator className="bg-slate-700 my-4" />
          <p className="text-xs text-slate-500">
            After updating .env.local, restart the dev server (<code className="bg-slate-800 px-1 rounded">pnpm dev</code>) for changes to take effect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
