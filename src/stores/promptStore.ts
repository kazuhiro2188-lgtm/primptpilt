"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PromptHistory } from "@/types/prompt";
import {
  fetchPromptsFromSupabase,
  addPromptToSupabase,
  toggleFavoriteInSupabase,
  deletePromptFromSupabase,
} from "@/lib/supabase/prompts";
import { createClient } from "@/lib/supabase/client";

interface PromptState {
  history: PromptHistory[];
  localHistory: PromptHistory[];
  addToHistory: (item: Omit<PromptHistory, "id" | "createdAt">) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
  getHistory: () => PromptHistory[];
  searchHistory: (query: string) => PromptHistory[];
  filterByCategory: (category: string) => PromptHistory[];
  hydrateFromSupabase: () => Promise<void>;
  setCloudMode: (enabled: boolean) => void;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      history: [],
      localHistory: [],

      addToHistory: async (item) => {
        const supabase = createClient();
        const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

        if (supabase && user) {
          const saved = await addPromptToSupabase(item);
          if (saved) {
            set((state) => ({ history: [saved, ...state.history] }));
            return;
          }
        }

        const newItem: PromptHistory = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          history: [newItem, ...state.history],
          localHistory: [newItem, ...state.localHistory],
        }));
      },

      toggleFavorite: async (id) => {
        const supabase = createClient();
        const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

        if (supabase && user) {
          const ok = await toggleFavoriteInSupabase(id);
          if (ok) {
            set((state) => ({
              history: state.history.map((h) =>
                h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
              ),
            }));
            return;
          }
        }

        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          ),
          localHistory: state.localHistory.map((h) =>
            h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
          ),
        }));
      },

      deleteFromHistory: async (id) => {
        const supabase = createClient();
        const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

        if (supabase && user) {
          await deletePromptFromSupabase(id);
        }
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
          localHistory: state.localHistory.filter((h) => h.id !== id),
        }));
      },

      getHistory: () => get().history,

      searchHistory: (query) => {
        const q = query.toLowerCase().trim();
        const list = get().history;
        if (!q) return list;
        return list.filter(
          (h) =>
            h.goal.toLowerCase().includes(q) ||
            h.generatedPrompt.toLowerCase().includes(q) ||
            h.title?.toLowerCase().includes(q)
        );
      },

      filterByCategory: (category) => {
        if (!category) return get().history;
        return get().history.filter((h) => h.category === category);
      },

      hydrateFromSupabase: async () => {
        const prompts = await fetchPromptsFromSupabase();
        set({ history: prompts });
      },

      setCloudMode: (enabled) => {
        if (enabled) {
          get().hydrateFromSupabase();
        } else {
          set((state) => ({ history: state.localHistory }));
        }
      },
    }),
    {
      name: "prompt-pilot-history",
      partialize: (state) => ({ localHistory: state.localHistory }),
    }
  )
);
