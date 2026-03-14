"use client";

import { TONES } from "@/lib/constants";
import type { ToneId } from "@/types/prompt";
import { cn } from "@/lib/utils";

interface ToneSelectorProps {
  value: ToneId;
  onChange: (value: ToneId) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TONES.map((tone) => (
        <button
          key={tone.id}
          type="button"
          onClick={() => onChange(tone.id)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-all duration-200",
            value === tone.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted/30"
          )}
        >
          {tone.label}
        </button>
      ))}
    </div>
  );
}
