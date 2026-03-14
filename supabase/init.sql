-- ============================================
-- PromptPilot Supabase 初期セットアップ
-- Supabase ダッシュボード > SQL Editor で実行
-- ============================================

-- 1. UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. テーブル作成
-- Users（auth.users を拡張）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  industry TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  goal TEXT NOT NULL,
  category TEXT NOT NULL,
  tone TEXT NOT NULL,
  output_format TEXT NOT NULL,
  audience TEXT,
  extra TEXT,
  generated_prompt TEXT NOT NULL,
  generation_mode TEXT DEFAULT 'quick' CHECK (generation_mode IN ('quick', 'hearing', 'template')),
  is_favorite BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt Versions
CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  change_note TEXT,
  rating TEXT CHECK (rating IN ('good', 'bad')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, version_number)
);

-- Tags
CREATE TABLE IF NOT EXISTS public.prompt_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL
);

-- Diagnose Results
CREATE TABLE IF NOT EXISTS public.diagnose_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  specificity_score INTEGER NOT NULL,
  structure_score INTEGER NOT NULL,
  clarity_score INTEGER NOT NULL,
  coverage_score INTEGER NOT NULL,
  efficiency_score INTEGER NOT NULL,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  base_prompt TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_official BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. インデックス
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON public.prompts(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt_id ON public.prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_name ON public.prompt_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);

-- 4. サインアップ時に public.users を作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RLS 有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnose_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 6. RLS ポリシー
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "folders_all_own" ON public.folders;
CREATE POLICY "folders_all_own" ON public.folders FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prompts_select_own" ON public.prompts;
DROP POLICY IF EXISTS "prompts_insert_own" ON public.prompts;
DROP POLICY IF EXISTS "prompts_update_own" ON public.prompts;
DROP POLICY IF EXISTS "prompts_delete_own" ON public.prompts;
CREATE POLICY "prompts_select_own" ON public.prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prompts_insert_own" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompts_update_own" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prompts_delete_own" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prompt_versions_select" ON public.prompt_versions;
DROP POLICY IF EXISTS "prompt_versions_insert" ON public.prompt_versions;
CREATE POLICY "prompt_versions_select" ON public.prompt_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));
CREATE POLICY "prompt_versions_insert" ON public.prompt_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "prompt_tags_all" ON public.prompt_tags;
CREATE POLICY "prompt_tags_all" ON public.prompt_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "diagnose_results_all" ON public.diagnose_results;
CREATE POLICY "diagnose_results_all" ON public.diagnose_results FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "templates_select" ON public.templates;
CREATE POLICY "templates_select" ON public.templates FOR SELECT
  USING (is_official = TRUE OR author_id = auth.uid() OR author_id IS NULL);
