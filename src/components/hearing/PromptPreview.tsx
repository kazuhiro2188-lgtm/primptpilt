"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/shared/CopyButton";
import { Check, RotateCcw } from "lucide-react";

interface PromptPreviewProps {
  prompt: string;
  onConfirm: (finalPrompt: string) => void;
  onReset: () => void;
}

export function PromptPreview({ prompt, onConfirm, onReset }: PromptPreviewProps) {
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">プロンプトプレビュー</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            やり直す
          </Button>
          <CopyButton text={editedPrompt} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            必要に応じて編集してから確定してください
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            rows={16}
            className="font-mono text-sm resize-none"
          />
        </CardContent>
      </Card>

      <Button onClick={() => onConfirm(editedPrompt)} size="lg" className="w-full sm:w-auto">
        <Check className="h-4 w-4 mr-2" />
        確定して履歴に保存
      </Button>
    </div>
  );
}
