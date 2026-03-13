"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("メールアドレスとパスワードを入力してください");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = tab === "signin" ? await signIn(email, password) : await signUp(email, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success(tab === "signin" ? "ログインしました" : "アカウントを作成しました。確認メールをご確認ください。");
        onOpenChange(false);
        setEmail("");
        setPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tab === "signin" ? "ログイン" : "アカウント作成"}</DialogTitle>
          <DialogDescription>
            {tab === "signin"
              ? "メールアドレスとパスワードでログインして、履歴をクラウドに同期できます"
              : "アカウントを作成して、プロンプト履歴をクラウドに保存しましょう"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-email">メールアドレス</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">パスワード</Label>
            <Input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "処理中..." : tab === "signin" ? "ログイン" : "アカウント作成"}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
            >
              {tab === "signin" ? "アカウントを作成" : "すでにアカウントをお持ちの方"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
