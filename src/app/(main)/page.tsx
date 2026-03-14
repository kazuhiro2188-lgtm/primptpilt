"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, MessageCircle, History, Stethoscope, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08 + 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const cards = [
  {
    icon: Zap,
    title: "クイック生成",
    description: "フォームに入力するだけで、AIが構造化プロンプトを生成します",
    href: "/generate",
    label: "始める",
  },
  {
    icon: MessageCircle,
    title: "ヒアリングモード",
    description: "AIとの対話でプロンプトを組み立てる",
    href: "/hearing",
    label: "始める",
  },
  {
    icon: FileText,
    title: "テンプレート",
    description: "業種×用途別のプリセットからカスタマイズして生成",
    href: "/templates",
    label: "テンプレートを見る",
  },
  {
    icon: Sparkles,
    title: "プロンプト改善",
    description: "既存プロンプトをAIが自動でリライトし、より効果的に",
    href: "/improve",
    label: "改善する",
  },
  {
    icon: Stethoscope,
    title: "プロンプト診断",
    description: "既存プロンプトの品質を診断し、改善ポイントを把握",
    href: "/diagnose",
    label: "診断する",
  },
  {
    icon: History,
    title: "履歴",
    description: "生成したプロンプトの保存・検索・再利用",
    href: "/history",
    label: "履歴を見る",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12 -mt-8">
      <section className="text-center space-y-6 -mt-24 overflow-hidden">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src="/images/promptpilot_home.png"
            alt="PromptPilot"
            width={500}
            height={500}
            className="w-48 h-auto sm:w-64 md:w-72"
            priority
          />
        </motion.div>
        <motion.p
          className="text-lg max-w-2xl mx-auto -mt-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="font-semibold tracking-[0.03em] bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_1px_10px_rgba(79,70,229,0.25)]">
            プロ品質の構造化プロンプトを自動生成
          </span>
        </motion.p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:min-h-[760px] sm:[grid-template-rows:repeat(3,1fr)] lg:min-h-[500px] lg:[grid-template-rows:repeat(2,1fr)]">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.href}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full min-h-[236px] hover:border-primary/50 transition-all duration-300 flex flex-col",
                  "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
                  "hover:ring-2 hover:ring-primary/20"
                )}
              >
                <CardContent className="pt-6 flex flex-col flex-1 text-center items-center group/card-content">
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Icon className="h-10 w-10 text-primary" />
                  </motion.div>
                <h2 className="font-semibold text-lg mb-2">{card.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className={cn(
                    buttonVariants(),
                    "inline-flex w-full transition-transform duration-200 hover:scale-[1.02]"
                  )}
                >
                  {card.label}
                </Link>
              </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
