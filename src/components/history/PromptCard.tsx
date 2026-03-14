"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import { Star, Pencil, Trash2, Target, Sparkles } from "lucide-react";
import type { PromptHistory } from "@/types/prompt";
import { CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface PromptCardProps {
  item: PromptHistory;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ item, onToggleFavorite, onDelete }: PromptCardProps) {
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === item.category);
  const Icon = cat?.icon ?? Target;

  const handleEdit = () => {
    router.push(`/generate?goal=${encodeURIComponent(item.goal)}&category=${item.category}&tone=${item.tone}&outputFormat=${item.outputFormat}`);
  };

  const handleImprove = () => {
    router.push(`/improve?prompt=${encodeURIComponent(item.generatedPrompt)}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 shrink-0" />
          <h3 className="font-semibold text-sm truncate max-w-[200px]">
            {item.title || item.goal.slice(0, 50)}
          </h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(item.id)}
          >
            <Star
              className={`h-4 w-4 ${item.isFavorite ? "fill-yellow-400 text-yellow-500" : ""}`}
            />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.generatedPrompt.slice(0, 150)}...
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={item.generatedPrompt} />
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            再編集
          </Button>
          <Button variant="outline" size="sm" onClick={handleImprove}>
            <Sparkles className="h-4 w-4 mr-2" />
            改善
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
