"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORY_TO_SUBCATEGORY: Record<string, string> = {
  support: "カスタマーサポート",
  planning: "企画・分析",
};
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { Search, FileText } from "lucide-react";

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (categoryFilter) {
      const subcat = CATEGORY_TO_SUBCATEGORY[categoryFilter];
      list = list.filter((t) =>
        subcat ? t.subcategory === subcat : t.category === categoryFilter
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subcategory.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, categoryFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          テンプレートライブラリ
        </h1>
        <p className="text-muted-foreground mt-1">
          業種×用途別のプリセットから、カスタマイズしてプロンプトを生成
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="テンプレートを検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !categoryFilter
                ? "bg-primary/10 border-primary text-primary"
                : "border-border hover:bg-muted/50"
            }`}
          >
            すべて
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => {
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
            該当するテンプレートがありません
          </p>
        ) : (
          filtered.map((template, index) => {
            const Icon = template.icon;
            return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
            <Link href={`/templates/${template.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="mb-2 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 origin-left">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{template.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <span className="inline-block mt-2 text-xs text-muted-foreground">
                    {template.subcategory}
                  </span>
                </CardContent>
              </Card>
            </Link>
            </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
