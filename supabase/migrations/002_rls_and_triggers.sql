-- 002_rls_and_triggers.sql
-- RLSポリシーとサインアップ時のusers作成トリガー

-- public.users 作成トリガー（auth.users にユーザーが作成されたら public.users にも追加）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnose_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- users: 自分のレコードのみ読み取り・更新可能
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- folders: 自分のフォルダのみ
CREATE POLICY "folders_all_own" ON public.folders FOR ALL USING (auth.uid() = user_id);

-- prompts: 自分のプロンプトのみ
CREATE POLICY "prompts_select_own" ON public.prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prompts_insert_own" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompts_update_own" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prompts_delete_own" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

-- prompt_versions: 自分のプロンプト経由でのみ
CREATE POLICY "prompt_versions_select" ON public.prompt_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));
CREATE POLICY "prompt_versions_insert" ON public.prompt_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

-- prompt_tags: 自分のプロンプト経由でのみ
CREATE POLICY "prompt_tags_all" ON public.prompt_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

-- diagnose_results: 自分のプロンプト経由でのみ
CREATE POLICY "diagnose_results_all" ON public.diagnose_results FOR ALL
  USING (EXISTS (SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()));

-- templates: 公式テンプレートは全員読める、それ以外は作者のみ
CREATE POLICY "templates_select" ON public.templates FOR SELECT
  USING (is_official = TRUE OR author_id = auth.uid() OR author_id IS NULL);
