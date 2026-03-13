"use client";

import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSupabaseReady: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isSupabaseReady: isSupabaseConfigured(),

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  initAuth: async () => {
    if (!get().isSupabaseReady) {
      set({ isLoading: false });
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      set({ isLoading: false });
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      user: session?.user ?? null,
      session,
      isLoading: false,
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
      });
    });
  },

  signIn: async (email, password) => {
    const supabase = createClient();
    if (!supabase) return { error: "Supabaseが設定されていません" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password) => {
    const supabase = createClient();
    if (!supabase) return { error: "Supabaseが設定されていません" };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
