"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ResultDisplay } from "@/components/generate/ResultDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromptStore } from "@/stores/promptStore";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function ImproveForm() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setPrompt(decodeURIComponent(p));
  }, [searchParams]);

  const addToHistory = usePromptStore((s) => s.addToHistory);

  const canImprove = prompt.trim().length > 0;

  const handleImprove = async () => {
    if (!canImprove) return;
    setIsLoading(true);
    setIsStreaming(true);
    setResult("");

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          instruction: instruction.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "改善に失敗しました");
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
        const title = "プロンプト改善" + (instruction ? `（${instruction.slice(0, 20)}...）` : "");
        await addToHistory({
          title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
          goal: prompt.slice(0, 100) + (prompt.length > 100 ? "..." : ""),
          category: "other",
          tone: "professional",
          outputFormat: "text",
          generatedPrompt: fullText,
          generationMode: "improve",
          isFavorite: false,
        });
        toast.success("プロンプトを改善し、履歴に保存しました");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "改善に失敗しました");
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setResult("");
    handleImprove();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,minmax(360px,1fr)] lg:items-start">
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              改善したいプロンプト
            </Label>
            <Textarea
              id="prompt"
              placeholder="例: メールを書いて。敬語で。"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="resize-none min-h-[180px] rounded-lg border-input focus-visible:ring-2 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instruction" className="text-sm font-medium text-muted-foreground">
              改善の指示（任意）
            </Label>
            <Textarea
              id="instruction"
              placeholder="例: もっと具体的に、トーンをカジュアルに、出力形式を箇条書きで"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              className="resize-none rounded-lg border-input focus-visible:ring-2"
            />
          </div>

          <Button
            onClick={handleImprove}
            disabled={!canImprove || isLoading}
            size="lg"
            className="w-full h-11 text-base font-medium rounded-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                改善中...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                プロンプトを改善
              </>
            )}
          </Button>
        </CardContent>
      </Card>

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
