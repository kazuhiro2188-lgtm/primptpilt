"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUIStore } from "@/stores/uiStore";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingModal } from "@/components/shared/OnboardingModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <ThemeProvider>
      <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="pt-14 transition-all duration-200 lg:pl-64">
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
      <Toaster />
      <OnboardingModal />
      </AuthProvider>
    </ThemeProvider>
  );
}
