"use client";

import { useMemo } from "react";
import type { DiagnoseResult } from "@/types/diagnose";
import { DIAGNOSE_AXES } from "@/types/diagnose";

interface RadarChartProps {
  result: DiagnoseResult;
  size?: number;
}

export function RadarChart({ result, size = 200 }: RadarChartProps) {
  const { polygon } = useMemo(() => {
    const center = size / 2;
    const radius = center - 20;
    const angleStep = (2 * Math.PI) / 5;

    const points = DIAGNOSE_AXES.map((axis, i) => {
      const score = result.scores[axis.key]?.score ?? 0;
      const normalized = score / 5;
      const angle = -Math.PI / 2 + i * angleStep;
      return {
        x: center + radius * normalized * Math.cos(angle),
        y: center + radius * normalized * Math.sin(angle),
        label: axis.label,
      };
    });

    const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

    return { polygon };
  }, [result, size]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景グリッド（5段階） */}
        {[1, 2, 3, 4, 5].map((level) => {
          const r = ((size / 2 - 20) * level) / 5;
          const center = size / 2;
          const angleStep = (2 * Math.PI) / 5;
          const pts = DIAGNOSE_AXES.map((_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={0.5}
            />
          );
        })}

        {/* 軸ラベル */}
        {DIAGNOSE_AXES.map((axis, i) => {
          const angleStep = (2 * Math.PI) / 5;
          const angle = -Math.PI / 2 + i * angleStep;
          const r = size / 2 - 5;
          const x = size / 2 + r * Math.cos(angle);
          const y = size / 2 + r * Math.sin(angle);
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-medium"
            >
              {axis.label}
            </text>
          );
        })}

        {/* データポリゴン */}
        <polygon
          points={polygon}
          fill="hsl(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
