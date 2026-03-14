import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Megaphone,
  Code2,
  Headphones,
  Search,
  Mail,
  ClipboardList,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  PenLine,
  Plug,
  TestTube,
  HelpCircle,
  MessageCircle,
  BookOpen,
  Swords,
  Target,
  User,
} from "lucide-react";
import type { Template } from "@/types/template";

export const TEMPLATE_CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "business", label: "業務全般", icon: BarChart3 },
  { id: "marketing", label: "マーケティング", icon: Megaphone },
  { id: "coding", label: "開発", icon: Code2 },
  { id: "support", label: "カスタマーサポート", icon: Headphones },
  { id: "planning", label: "企画・分析", icon: Search },
];

export const TEMPLATES: Template[] = [
  // 業務全般
  {
    id: "email-creation",
    title: "メール作成",
    description: "お礼・依頼・報告など、ビジネスメール用の構造化プロンプトを生成",
    category: "business",
    subcategory: "業務全般",
    icon: Mail,
    variables: [
      { key: "purpose", label: "メールの目的", placeholder: "例: お礼、依頼、報告", required: true },
      { key: "audience", label: "宛先", placeholder: "例: 取引先、社内", required: true },
      { key: "tone", label: "トーンの希望", placeholder: "例: 丁寧、簡潔", required: false },
    ],
    goalTemplate: "{{purpose}}のメールを{{audience}}向けに作成したい。{{tone}}",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  {
    id: "meeting-summary",
    title: "議事録要約",
    description: "会議議事録を要約するためのプロンプトを生成",
    category: "business",
    subcategory: "業務全般",
    icon: ClipboardList,
    variables: [
      { key: "meetingType", label: "会議の種類", placeholder: "例: 定例会議、プロジェクトKickoff", required: true },
      { key: "outputLength", label: "要約の長さ", placeholder: "例: 500字程度、箇条書き10項目", required: false },
    ],
    goalTemplate: "{{meetingType}}の議事録を要約したい。{{outputLength}}",
    defaultTone: "professional",
    defaultOutputFormat: "list",
  },
  {
    id: "report-creation",
    title: "報告書作成",
    description: "週次・月次など業務報告書のプロンプトを生成",
    category: "business",
    subcategory: "業務全般",
    icon: FileText,
    variables: [
      { key: "reportType", label: "報告書の種類", placeholder: "例: 週次報告、月次報告", required: true },
      { key: "content", label: "含めたい内容", placeholder: "例: 進捗、課題、次週の予定", required: true },
    ],
    goalTemplate: "{{reportType}}を作成したい。{{content}}を含めたい。",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  {
    id: "translation",
    title: "翻訳",
    description: "多言語翻訳用の高品質プロンプトを生成",
    category: "business",
    subcategory: "業務全般",
    icon: Globe,
    variables: [
      { key: "fromTo", label: "翻訳方向", placeholder: "例: 日本語→英語、英語→日本語", required: true },
      { key: "domain", label: "分野", placeholder: "例: ビジネス、技術、法律", required: false },
    ],
    goalTemplate: "{{fromTo}}の翻訳をしたい。{{domain}}分野の文章。",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  // マーケティング
  {
    id: "sns-post",
    title: "SNS投稿",
    description: "Instagram・X・Facebook等のSNS投稿文プロンプトを生成",
    category: "marketing",
    subcategory: "マーケティング",
    icon: Smartphone,
    variables: [
      { key: "platform", label: "プラットフォーム", placeholder: "例: Instagram、X、Facebook", required: true },
      { key: "product", label: "商品・サービス名", placeholder: "例: 新商品A", required: true },
      { key: "target", label: "ターゲット", placeholder: "例: 20代女性", required: false },
      { key: "hashtags", label: "ハッシュタグ数", placeholder: "例: 5個", required: false },
    ],
    goalTemplate: "{{platform}}で{{product}}の投稿文を作りたい。ターゲットは{{target}}。ハッシュタグは{{hashtags}}。",
    defaultTone: "casual",
    defaultOutputFormat: "text",
  },
  {
    id: "ad-copy",
    title: "広告文",
    description: "ウェブバナー・リスティング等の広告コピープロンプトを生成",
    category: "marketing",
    subcategory: "マーケティング",
    icon: Megaphone,
    variables: [
      { key: "media", label: "媒体", placeholder: "例: ウェブバナー、リスティング広告", required: true },
      { key: "product", label: "商品・サービス", placeholder: "例: オンライン講座", required: true },
      { key: "length", label: "文字数目安", placeholder: "例: 30文字以内", required: false },
    ],
    goalTemplate: "{{media}}用の広告文を{{product}}向けに作りたい。{{length}}",
    defaultTone: "creative",
    defaultOutputFormat: "text",
  },
  {
    id: "lp-structure",
    title: "LP構成",
    description: "LPの構成案・セクション設計のプロンプトを生成",
    category: "marketing",
    subcategory: "マーケティング",
    icon: Monitor,
    variables: [
      { key: "product", label: "商品・サービス", placeholder: "例: SaaSツール", required: true },
      { key: "target", label: "ターゲット", placeholder: "例: 中小企業のマーケ担当", required: true },
    ],
    goalTemplate: "{{product}}のLP構成を{{target}}向けに考えたい。",
    defaultTone: "professional",
    defaultOutputFormat: "list",
  },
  {
    id: "seo-article",
    title: "SEO記事",
    description: "SEOを意識した記事執筆のプロンプトを生成",
    category: "marketing",
    subcategory: "マーケティング",
    icon: PenLine,
    variables: [
      { key: "keyword", label: "ターゲットキーワード", placeholder: "例: プロンプト 書き方", required: true },
      { key: "wordCount", label: "文字数目安", placeholder: "例: 3000字", required: false },
    ],
    goalTemplate: "「{{keyword}}」でSEO記事を書きたい。{{wordCount}}",
    defaultTone: "professional",
    defaultOutputFormat: "markdown",
  },
  // 開発
  {
    id: "code-generation",
    title: "コード生成",
    description: "機能実装のコード生成プロンプトを生成",
    category: "coding",
    subcategory: "開発",
    icon: Code2,
    variables: [
      { key: "language", label: "言語・フレームワーク", placeholder: "例: TypeScript, React", required: true },
      { key: "feature", label: "実装したい機能", placeholder: "例: フォームのバリデーション", required: true },
    ],
    goalTemplate: "{{language}}で{{feature}}を実装したい。",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  {
    id: "code-review",
    title: "コードレビュー",
    description: "コード品質チェック用のレビュープロンプトを生成",
    category: "coding",
    subcategory: "開発",
    icon: Search,
    variables: [
      { key: "language", label: "言語", placeholder: "例: Python", required: true },
      { key: "focus", label: "重点チェック項目", placeholder: "例: セキュリティ、パフォーマンス", required: false },
    ],
    goalTemplate: "{{language}}のコードレビューをしてほしい。{{focus}}を重点的に。",
    defaultTone: "professional",
    defaultOutputFormat: "list",
  },
  {
    id: "api-design",
    title: "API設計",
    description: "REST・GraphQL等のAPI設計プロンプトを生成",
    category: "coding",
    subcategory: "開発",
    icon: Plug,
    variables: [
      { key: "purpose", label: "APIの目的", placeholder: "例: ユーザー管理", required: true },
      { key: "style", label: "スタイル", placeholder: "例: REST、GraphQL", required: false },
    ],
    goalTemplate: "{{purpose}}のAPIを設計したい。{{style}}で。",
    defaultTone: "professional",
    defaultOutputFormat: "json",
  },
  {
    id: "test-creation",
    title: "テスト作成",
    description: "単体テスト・結合テストのプロンプトを生成",
    category: "coding",
    subcategory: "開発",
    icon: TestTube,
    variables: [
      { key: "framework", label: "テストフレームワーク", placeholder: "例: Jest, pytest", required: true },
      { key: "target", label: "テスト対象", placeholder: "例: ユーザー登録関数", required: true },
    ],
    goalTemplate: "{{framework}}で{{target}}のテストを作成したい。",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  // カスタマーサポート
  {
    id: "faq-creation",
    title: "FAQ作成",
    description: "よくある質問と回答のFAQプロンプトを生成",
    category: "writing",
    subcategory: "カスタマーサポート",
    icon: HelpCircle,
    variables: [
      { key: "product", label: "商品・サービス", placeholder: "例: 会員制アプリ", required: true },
      { key: "count", label: "FAQ数", placeholder: "例: 10個", required: false },
    ],
    goalTemplate: "{{product}}のFAQを{{count}}作成したい。",
    defaultTone: "professional",
    defaultOutputFormat: "list",
  },
  {
    id: "reply-generation",
    title: "返信文生成",
    description: "クレーム・問い合わせ対応の返信文プロンプトを生成",
    category: "writing",
    subcategory: "カスタマーサポート",
    icon: MessageCircle,
    variables: [
      { key: "situation", label: "状況", placeholder: "例: クレーム、問い合わせ", required: true },
      { key: "tone", label: "トーン", placeholder: "例: 丁寧に、謝罪を込めて（空欄可）", required: false },
    ],
    goalTemplate: "{{situation}}への返信文を作成したい。{{tone}}",
    defaultTone: "professional",
    defaultOutputFormat: "text",
  },
  {
    id: "manual-creation",
    title: "マニュアル作成",
    description: "操作手順・利用ガイドのマニュアルプロンプトを生成",
    category: "writing",
    subcategory: "カスタマーサポート",
    icon: BookOpen,
    variables: [
      { key: "target", label: "対象", placeholder: "例: 管理画面の操作", required: true },
      { key: "audience", label: "読者", placeholder: "例: 非エンジニア向け（空欄可）", required: false },
    ],
    goalTemplate: "{{target}}のマニュアルを作成したい。{{audience}}",
    defaultTone: "professional",
    defaultOutputFormat: "markdown",
  },
  // 企画・分析
  {
    id: "market-research",
    title: "市場調査",
    description: "業界・市場規模・トレンド分析のプロンプトを生成",
    category: "analysis",
    subcategory: "企画・分析",
    icon: BarChart3,
    variables: [
      { key: "industry", label: "業界", placeholder: "例:  EdTech", required: true },
      { key: "focus", label: "調査の焦点", placeholder: "例: 市場規模、トレンド", required: false },
    ],
    goalTemplate: "{{industry}}の市場調査をしたい。{{focus}}",
    defaultTone: "academic",
    defaultOutputFormat: "list",
  },
  {
    id: "competitor-analysis",
    title: "競合分析",
    description: "競合比較・差別化ポイント分析のプロンプトを生成",
    category: "analysis",
    subcategory: "企画・分析",
    icon: Swords,
    variables: [
      { key: "product", label: "自社製品・サービス", placeholder: "例: プロジェクト管理ツール", required: true },
      { key: "competitors", label: "競合", placeholder: "例: Notion、Trello", required: false },
    ],
    goalTemplate: "{{product}}の競合分析をしたい。{{competitors}}と比較。",
    defaultTone: "professional",
    defaultOutputFormat: "table",
  },
  {
    id: "swot-analysis",
    title: "SWOT分析",
    description: "強み・弱み・機会・脅威のSWOT分析プロンプトを生成",
    category: "analysis",
    subcategory: "企画・分析",
    icon: Target,
    variables: [
      { key: "subject", label: "分析対象", placeholder: "例: 新規事業A", required: true },
      { key: "context", label: "背景・状況", placeholder: "例: 来年ローンチ予定", required: false },
    ],
    goalTemplate: "{{subject}}のSWOT分析をしたい。{{context}}",
    defaultTone: "professional",
    defaultOutputFormat: "table",
  },
  {
    id: "persona-design",
    title: "ペルソナ設計",
    description: "ターゲット顧客のペルソナ設計プロンプトを生成",
    category: "analysis",
    subcategory: "企画・分析",
    icon: User,
    variables: [
      { key: "product", label: "商品・サービス", placeholder: "例: B2B SaaS", required: true },
      { key: "count", label: "ペルソナ数", placeholder: "例: 3人分（空欄可）", required: false },
    ],
    goalTemplate: "{{product}}のペルソナを設計したい。{{count}}",
    defaultTone: "professional",
    defaultOutputFormat: "list",
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(categoryId: string): Template[] {
  return TEMPLATES.filter((t) => t.subcategory === categoryId || t.category === categoryId);
}

export function buildGoalFromTemplate(
  template: Template,
  values: Record<string, string>
): string {
  let goal = template.goalTemplate;
  for (const v of template.variables) {
    const value = values[v.key]?.trim() || "";
    goal = goal.replace(new RegExp(`{{${v.key}}}`, "g"), value);
  }
  // 残ったプレースホルダーを空文字に、連続スペース・句読点を整理
  goal = goal
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[。、]\s*[。、]+/g, "。")
    .trim();
  return goal;
}
