import { createClient } from "./client";
import type { PromptHistory } from "@/types/prompt";

const toDb = (item: Omit<PromptHistory, "id" | "createdAt">) => ({
  title: item.title,
  goal: item.goal,
  category: item.category,
  tone: item.tone,
  output_format: item.outputFormat,
  audience: item.audience ?? null,
  extra: item.extra ?? null,
  generated_prompt: item.generatedPrompt,
  generation_mode: item.generationMode,
  is_favorite: item.isFavorite,
});

const fromDb = (row: {
  id: string;
  title: string | null;
  goal: string;
  category: string;
  tone: string;
  output_format: string;
  audience: string | null;
  extra: string | null;
  generated_prompt: string;
  generation_mode: string;
  is_favorite: boolean;
  created_at: string;
}): PromptHistory => ({
  id: row.id,
  title: row.title ?? row.goal.slice(0, 50),
  goal: row.goal,
  category: row.category as PromptHistory["category"],
  tone: row.tone as PromptHistory["tone"],
  outputFormat: row.output_format as PromptHistory["outputFormat"],
  audience: row.audience ?? undefined,
  extra: row.extra ?? undefined,
  generatedPrompt: row.generated_prompt,
  generationMode: row.generation_mode as PromptHistory["generationMode"],
  isFavorite: row.is_favorite,
  createdAt: row.created_at,
});

export async function fetchPromptsFromSupabase(): Promise<PromptHistory[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch prompts error:", error);
    return [];
  }
  return (data ?? []).map(fromDb);
}

export async function addPromptToSupabase(
  item: Omit<PromptHistory, "id" | "createdAt">
): Promise<PromptHistory | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      user_id: user.id,
      ...toDb(item),
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase add prompt error:", error);
    return null;
  }
  return fromDb(data);
}

export async function toggleFavoriteInSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { data: prompt } = await supabase.from("prompts").select("is_favorite").eq("id", id).single();
  if (!prompt) return false;

  const { error } = await supabase
    .from("prompts")
    .update({ is_favorite: !prompt.is_favorite })
    .eq("id", id);

  return !error;
}

export async function deletePromptFromSupabase(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("prompts").delete().eq("id", id);
  return !error;
}
