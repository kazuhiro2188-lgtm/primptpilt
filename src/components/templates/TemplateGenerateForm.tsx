"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResultDisplay } from "@/components/generate/ResultDisplay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromptStore } from "@/stores/promptStore";
import { buildGoalFromTemplate } from "@/lib/templates";
import type { Template } from "@/types/template";
import { toast } from "sonner";

interface TemplateGenerateFormProps {
  template: Template;
}

export function TemplateGenerateForm({ template }: TemplateGenerateFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const addToHistory = usePromptStore((s) => s.addToHistory);

  const canGenerate = template.variables
    .filter((v) => v.required)
    .every((v) => values[v.key]?.trim());

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    const goal = buildGoalFromTemplate(template, values);
    if (!goal.trim()) {
      toast.error("入力内容を確認してください");
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          category: template.category,
          tone: template.defaultTone,
          outputFormat: template.defaultOutputFormat,
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
                // ignore
              }
            }
          }
        }
      }

      setIsStreaming(false);

      if (fullText) {
        await addToHistory({
          title: template.title,
          goal,
          category: template.category,
          tone: template.defaultTone,
          outputFormat: template.defaultOutputFormat,
          extra: extra.trim() || undefined,
          generatedPrompt: fullText,
          generationMode: "template",
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
      <div className="space-y-4">
        {template.variables.map((v) => (
          <div key={v.key} className="space-y-2">
            <Label htmlFor={v.key}>
              {v.label}
              {v.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={v.key}
              placeholder={v.placeholder}
              value={values[v.key] ?? ""}
              onChange={(e) => handleChange(v.key, e.target.value)}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="extra">追加の要望・制約（任意）</Label>
        <Textarea
          id="extra"
          placeholder="例: 具体的なフォーマット、文字数制限など"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={2}
          className="resize-none"
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
        size="lg"
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
