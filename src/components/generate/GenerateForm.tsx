"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategorySelector } from "./CategorySelector";
import { ToneSelector } from "./ToneSelector";
import { OutputFormatSelector } from "./OutputFormatSelector";
import { ResultDisplay } from "./ResultDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromptStore } from "@/stores/promptStore";
import { CATEGORIES, TONES, OUTPUT_FORMATS } from "@/lib/constants";
import type { CategoryId, ToneId, OutputFormatId } from "@/types/prompt";
import { toast } from "sonner";

export function GenerateForm() {
  const searchParams = useSearchParams();
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState<CategoryId>("business");
  const [tone, setTone] = useState<ToneId>("professional");
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("text");
  const [audience, setAudience] = useState("");
  const [extra, setExtra] = useState("");

  useEffect(() => {
    const g = searchParams.get("goal");
    const c = searchParams.get("category");
    const t = searchParams.get("tone");
    const o = searchParams.get("outputFormat");
    if (g) setGoal(g);
    if (c && ["business", "marketing", "coding", "writing", "analysis", "other"].includes(c))
      setCategory(c as CategoryId);
    if (t && ["professional", "casual", "creative", "academic"].includes(t))
      setTone(t as ToneId);
    if (o && ["text", "list", "table", "json", "markdown"].includes(o))
      setOutputFormat(o as OutputFormatId);
  }, [searchParams]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const addToHistory = usePromptStore((s) => s.addToHistory);

  const canGenerate = goal.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setIsStreaming(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          category,
          tone,
          outputFormat,
          audience: audience.trim() || undefined,
          extra: extra.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "生成に失敗しました");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text_delta" && data.text) {
                  fullText += data.text;
                  setResult(fullText);
                } else if (data.type === "message_stop") {
                  break;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      }

      setIsStreaming(false);

      if (fullText) {
        const catLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
        const toneLabel = TONES.find((t) => t.id === tone)?.label ?? tone;
        const formatLabel = OUTPUT_FORMATS.find((f) => f.id === outputFormat)?.label ?? outputFormat;

        await addToHistory({
          title: goal.slice(0, 50) + (goal.length > 50 ? "..." : ""),
          goal,
          category,
          tone,
          outputFormat,
          audience: audience.trim() || undefined,
          extra: extra.trim() || undefined,
          generatedPrompt: fullText,
          generationMode: "quick",
          isFavorite: false,
        });
        toast.success("プロンプトを生成し、履歴に保存しました");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "生成に失敗しました");
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setResult("");
    handleGenerate();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="goal">やりたいこと</Label>
        <Textarea
          id="goal"
          placeholder="例: 新商品のInstagram投稿文を作りたい"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>カテゴリ</Label>
        <CategorySelector value={category} onChange={setCategory} />
      </div>

      <div className="space-y-2">
        <Label>トーン</Label>
        <ToneSelector value={tone} onChange={setTone} />
      </div>

      <div className="space-y-2">
        <Label>出力形式</Label>
        <OutputFormatSelector value={outputFormat} onChange={setOutputFormat} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">対象ユーザー（任意）</Label>
        <Input
          id="audience"
          placeholder="例: 20代女性"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="extra">追加の要望・制約（任意）</Label>
        <Input
          id="extra"
          placeholder="例: ハッシュタグを5個含める"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            生成中...
          </>
        ) : (
          "プロンプトを生成"
        )}
      </Button>

      {(result || isLoading) && (
        <ResultDisplay
          result={result}
          isStreaming={isStreaming}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
