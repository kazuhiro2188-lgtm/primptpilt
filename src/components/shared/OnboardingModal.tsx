"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

const STEPS = [
  {
    title: "プロンプトの基本構造",
    content:
      "効果的なプロンプトは5つのセクションで構成されます：\n\n【役割】AIに与える専門家としての役割\n【背景】タスクの背景と目的\n【指示】具体的な指示\n【制約条件】トーンや形式の制約\n【出力形式】期待する出力のフォーマット",
  },
  {
    title: "具体性が重要",
    content:
      "曖昧な表現ではなく、具体的な数値・条件・固有名詞を入れることで、AIの回答精度が大幅に向上します。\n\n例：「良いメール」→「取引先向けの丁寧なフォーマルなメール、200文字以内」",
  },
  {
    title: "さっそく試してみよう",
    content:
      "「やりたいこと」を日本語で入力するだけで、プロが書いたような構造化プロンプトが自動生成されます。クイック生成から始めてみましょう！",
  },
];

export function OnboardingModal() {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { onboardingCompleted, completeOnboarding } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = !onboardingCompleted;
  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleClose = () => {
    completeOnboarding();
  };

  if (!mounted || !isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* モーダルコンテンツ */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-lg ring-1 ring-foreground/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h2 id="onboarding-title" className="text-base font-medium">
              PromptPilot へようこそ
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-muted -ml-2"
              aria-label="閉じる"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {currentStep.content}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={handleSkip}>
              スキップ
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  戻る
                </Button>
              )}
              {isLast ? (
                <Link
                  href="/"
                  className={cn(buttonVariants(), "inline-flex")}
                  onClick={completeOnboarding}
                >
                  始める
                </Link>
              ) : (
                <Button type="button" onClick={() => setStep((s) => s + 1)}>
                  次へ
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
