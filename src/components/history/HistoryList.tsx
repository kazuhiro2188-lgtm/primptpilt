"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PromptCard } from "./PromptCard";
import { usePromptStore } from "@/stores/promptStore";
import { CATEGORIES } from "@/lib/constants";
import { Search } from "lucide-react";

export function HistoryList() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { history, searchHistory, filterByCategory, toggleFavorite, deleteFromHistory } =
    usePromptStore();

  const filtered = useMemo(() => {
    let filtered = search ? searchHistory(search) : history;
    if (categoryFilter) {
      filtered = filtered.filter((h) => h.category === categoryFilter);
    }
    return filtered;
  }, [history, search, categoryFilter, searchHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="キーワードで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !categoryFilter ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted/50"
            }`}
          >
            すべて
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1 ${
                  categoryFilter === cat.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-12">
            履歴がありません。プロンプトを生成するとここに表示されます。
          </p>
        ) : (
          filtered.map((item) => (
            <PromptCard
              key={item.id}
              item={item}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteFromHistory}
            />
          ))
        )}
      </div>
    </div>
  );
}
