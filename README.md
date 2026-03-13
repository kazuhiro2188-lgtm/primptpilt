# PromptPilot

> プロンプト設計を、もっと簡単に。  
> AIへの指示を"操縦"する、メタプロンプト生成アプリ

## 概要

PromptPilotは「やりたいことを日本語で入力するだけで、プロが書いたような構造化プロンプトが手に入る」メタプロンプト生成アプリです。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **バックエンド**: Next.js API Routes, Anthropic Claude API
- **状態管理**: Zustand
- **バリデーション**: Zod

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、APIキーを設定してください。

```bash
cp .env.example .env.local
```

必須の環境変数:

- `ANTHROPIC_API_KEY`: Anthropic Claude API のAPIキー

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 主な機能（MVP）

- **クイック生成**: フォーム入力から構造化プロンプトを生成
- **ヒアリングモード**: AIとの対話でプロンプトを組み立てる
- **履歴管理**: 生成したプロンプトの保存・検索・お気に入り
- **オンボーディング**: 初回利用時のチュートリアル
- **ダークモード**: ライト/ダークテーマの切り替え

## Phase 2: Supabase 連携（オプション）

Supabase を設定すると、以下の機能が有効になります：

- **クラウド同期**: プロンプト履歴を Supabase に保存し、複数デバイスで同期
- **認証**: メール/パスワードでのログイン・サインアップ
- **データ永続化**: ローカルストレージに加え、クラウドにバックアップ

### Supabase のセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `.env.local` に以下を追加（`.env.example` のコメントを解除）:
   - `NEXT_PUBLIC_SUPABASE_URL`: プロジェクトの API URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 匿名（公開）キー
3. Supabase ダッシュボードで `supabase/migrations/` のマイグレーションを適用

## プロジェクト構成

```
src/
├── app/              # ページ・APIルート
├── components/       # UIコンポーネント
├── lib/              # ユーティリティ・メタプロンプト
├── stores/           # Zustand ストア
└── types/            # 型定義
```

## ライセンス

Private
