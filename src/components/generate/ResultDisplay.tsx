"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";
import { StreamingText } from "@/components/shared/StreamingText";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ResultDisplayProps {
  result: string;
  isStreaming: boolean;
  onRetry?: () => void;
  onCopy?: () => void;
}

export function ResultDisplay({
  result,
  isStreaming,
  onRetry,
}: ResultDisplayProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <h3 className="font-semibold text-base">生成されたプロンプト</h3>
        <div className="flex gap-2">
          {!isStreaming && result && (
            <CopyButton text={result} label="コピー" />
          )}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="rounded-lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              再生成
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="rounded-lg border bg-muted/20 p-4 min-h-[280px] font-mono text-sm leading-relaxed">
          {result ? (
            <StreamingText
              text={result}
              showCursor={isStreaming}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              プロンプトがここに表示されます
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
