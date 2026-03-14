import { Suspense } from "react";
import { Zap } from "lucide-react";
import { GenerateForm } from "@/components/generate/GenerateForm";

export default function GeneratePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          クイック生成
        </h1>
        <p className="text-muted-foreground mt-1.5 text-[15px]">
          やりたいことを入力するだけで、構造化プロンプトを自動生成します
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-96 bg-muted/50 rounded-xl" />}>
        <GenerateForm />
      </Suspense>
    </div>
  );
}
