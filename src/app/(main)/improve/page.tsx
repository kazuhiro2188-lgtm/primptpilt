import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { ImproveForm } from "@/components/improve/ImproveForm";

export default function ImprovePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          プロンプト改善
        </h1>
        <p className="text-muted-foreground mt-1">
          既存のプロンプトをAIが自動でリライトし、より効果的な形に整えます
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-96 bg-muted/50 rounded-xl" />}>
        <ImproveForm />
      </Suspense>
    </div>
  );
}
