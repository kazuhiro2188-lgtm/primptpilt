"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/generate", label: "クイック生成" },
  { href: "/hearing", label: "ヒアリング" },
  { href: "/templates", label: "テンプレート" },
  { href: "/diagnose", label: "診断" },
  { href: "/history", label: "履歴" },
];

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { theme, setTheme } = useUIStore();
  const { user, signOut } = useAuthStore();
  const showAuth = isSupabaseConfigured();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center font-semibold">
          <Image
            src="/images/promptpilot_sub.png"
            alt="PromptPilot"
            width={60}
            height={60}
            className="h-[60px] w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        {showAuth && (
          user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground truncate max-w-[120px]" title={user.email}>
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="ログアウト">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setAuthOpen(true)} title="ログイン">
              <LogIn className="h-5 w-5" />
            </Button>
          )
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
