"use client";

import { CATEGORIES } from "@/lib/constants";
import type { CategoryId } from "@/types/prompt";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  value: CategoryId;
  onChange: (value: CategoryId) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-200",
              value === cat.id
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                : "border-border hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="font-medium truncate">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
