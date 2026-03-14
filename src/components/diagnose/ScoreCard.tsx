"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DIAGNOSE_AXES } from "@/types/diagnose";
import type { DiagnoseResult } from "@/types/diagnose";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  result: DiagnoseResult;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 4) return "bg-green-500";
  if (score >= 3) return "bg-yellow-500";
  return "bg-red-500";
}

export function ScoreCard({ result, className }: ScoreCardProps) {
  const percentage = Math.round((result.totalScore / result.maxScore) * 100);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">診断スコア</h3>
          <div className="text-2xl font-bold">
            <span className={cn(
              percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
              {result.totalScore}
            </span>
            <span className="text-muted-foreground text-lg"> / {result.maxScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {DIAGNOSE_AXES.map((axis) => {
          const { score, feedback } = result.scores[axis.key];
          return (
            <div key={axis.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{axis.label}</span>
                <span className="text-muted-foreground">{score} / 5</span>
              </div>
              <div className="h-2 flex rounded-full overflow-hidden bg-muted">
                <div
                  className={cn("h-full transition-all", getScoreColor(score))}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{feedback}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
