"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CategorySelector } from "./CategorySelector";
import { ToneSelector } from "./ToneSelector";
import { OutputFormatSelector } from "./OutputFormatSelector";
import { ResultDisplay } from "./ResultDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromptStore } from "@/stores/promptStore";
import { CATEGORIES, TONES, OUTPUT_FORMATS } from "@/lib/constants";
import type { CategoryId, ToneId, OutputFormatId } from "@/types/prompt";
import { toast } from "sonner";
import { ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const hasOptions = audience.trim() || extra.trim();
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (hasOptions) setShowOptions(true);
  }, [hasOptions]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,minmax(360px,1fr)] lg:items-start">
      {/* フォーム */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-medium">
              やりたいこと
            </Label>
            <Textarea
              id="goal"
              placeholder="例: 新商品のInstagram投稿文を作りたい"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
              className="resize-none min-h-[100px] rounded-lg border-input focus-visible:ring-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">カテゴリ</Label>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">トーン</Label>
              <ToneSelector value={tone} onChange={setTone} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">出力形式</Label>
              <OutputFormatSelector value={outputFormat} onChange={setOutputFormat} />
            </div>
          </div>

          {/* 詳細オプション（折りたたみ） */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOptions((o) => !o)}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", showOptions && "rotate-180")} />
              詳細オプション {hasOptions && <span className="text-primary text-xs">(入力済み)</span>}
            </button>
            {showOptions && (
            <div className="px-4 pb-4 pt-1 space-y-4 border-t bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-medium text-muted-foreground">
                  対象ユーザー
                </Label>
                <Input
                  id="audience"
                  placeholder="例: 20代女性"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra" className="text-sm font-medium text-muted-foreground">
                  追加の要望・制約
                </Label>
                <Input
                  id="extra"
                  placeholder="例: ハッシュタグを5個含める"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            size="lg"
            className="w-full h-11 text-base font-medium rounded-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                生成中...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                プロンプトを生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 結果表示 */}
      {(result || isLoading) && (
        <div className="lg:sticky lg:top-20">
          <ResultDisplay
            result={result}
            isStreaming={isStreaming}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  );
}
