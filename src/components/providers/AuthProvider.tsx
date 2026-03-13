"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePromptStore } from "@/stores/promptStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isSupabaseReady = useAuthStore((s) => s.isSupabaseReady);
  const setCloudMode = usePromptStore((s) => s.setCloudMode);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const localHistory = usePromptStore((s) => s.localHistory);

  useEffect(() => {
    if (!isLoading && isSupabaseReady) {
      setCloudMode(!!session);
    } else if (!isLoading && !isSupabaseReady) {
      setCloudMode(false);
    }
  }, [isLoading, isSupabaseReady, session, setCloudMode, localHistory]);

  return <>{children}</>;
}
