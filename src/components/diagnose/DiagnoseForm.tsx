"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScoreCard } from "./ScoreCard";
import { RadarChart } from "./RadarChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { DiagnoseResult } from "@/types/diagnose";
import { toast } from "sonner";
import { Stethoscope, Sparkles } from "lucide-react";

export function DiagnoseForm() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDiagnose = async () => {
    const text = prompt.trim();
    if (!text) {
      toast.error("プロンプトを入力してください");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "診断に失敗しました");
      }

      const data: DiagnoseResult = await res.json();
      setResult(data);
      toast.success("診断が完了しました");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "診断に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">診断するプロンプト</Label>
        <Textarea
          id="prompt"
          placeholder="例: AIに良いメール文を書かせたい"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="resize-none font-mono text-sm"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleDiagnose}
          disabled={!prompt.trim() || isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              診断中...
            </>
          ) : (
            <>
              <Stethoscope className="h-4 w-4 mr-2" />
              診断する
            </>
          )}
        </Button>
        {result && (
          <>
            <Button variant="outline" onClick={handleReset}>
              やり直す
            </Button>
            <Link href={`/improve?prompt=${encodeURIComponent(prompt)}`}>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                プロンプト改善へ
              </Button>
            </Link>
          </>
        )}
      </div>

      {result && (
        <div className="space-y-6 pt-6 border-t">
          <div className="grid gap-6 md:grid-cols-2">
            <ScoreCard result={result} />
            <div className="flex flex-col items-center justify-center">
              <RadarChart result={result} size={220} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">総合評価</h3>
            <p className="text-sm text-muted-foreground">{result.overallFeedback}</p>
          </div>

          {result.improvementSuggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">改善提案</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {result.improvementSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
