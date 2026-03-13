"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthModal } from "@/components/auth/AuthModal";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const { theme, setTheme, resetOnboarding } = useUIStore();
  const { user, signOut } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const showAuth = isSupabaseConfigured();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetOnboarding = () => {
    resetOnboarding();
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground mt-1">
          アプリの設定を変更する
        </p>
      </div>

      {showAuth && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">アカウント</h2>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ログイン中: {user.email}
                </p>
                <Button variant="outline" onClick={() => signOut()}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ログインするとプロンプト履歴をクラウドに同期できます
                </p>
                <Button onClick={() => setAuthOpen(true)}>ログイン / アカウント作成</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">外観</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">テーマ</p>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                >
                  {t === "light" ? "ライト" : t === "dark" ? "ダーク" : "システム"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">チュートリアル</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            初回表示のオンボーディングを再度表示できます
          </p>
          <Button variant="outline" onClick={handleResetOnboarding}>
            チュートリアルを再表示
          </Button>
        </CardContent>
      </Card>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
