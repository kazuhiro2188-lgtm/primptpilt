import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Megaphone,
  Code2,
  PenLine,
  Search,
  Target,
} from "lucide-react";
import type { CategoryId, ToneId, OutputFormatId } from "@/types/prompt";

export const CATEGORIES: { id: CategoryId; label: string; icon: LucideIcon }[] = [
  { id: "business", label: "業務効率化", icon: BarChart3 },
  { id: "marketing", label: "マーケティング", icon: Megaphone },
  { id: "coding", label: "開発・コーディング", icon: Code2 },
  { id: "writing", label: "ライティング", icon: PenLine },
  { id: "analysis", label: "分析・リサーチ", icon: Search },
  { id: "other", label: "その他", icon: Target },
];

export const TONES: { id: ToneId; label: string }[] = [
  { id: "professional", label: "プロフェッショナル" },
  { id: "casual", label: "カジュアル" },
  { id: "creative", label: "クリエイティブ" },
  { id: "academic", label: "アカデミック" },
];

export const OUTPUT_FORMATS: { id: OutputFormatId; label: string }[] = [
  { id: "text", label: "テキスト" },
  { id: "list", label: "箇条書き" },
  { id: "table", label: "表形式" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
];
