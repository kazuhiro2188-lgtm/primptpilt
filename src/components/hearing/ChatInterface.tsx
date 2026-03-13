"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "./ChatBubble";
import { PromptPreview } from "./PromptPreview";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePromptStore } from "@/stores/promptStore";
import { RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";

const INITIAL_QUESTION = "何を達成したいですか？";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: INITIAL_QUESTION },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completedPrompt, setCompletedPrompt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addToHistory = usePromptStore((s) => s.addToHistory);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/hearing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("ヒアリングの処理に失敗しました");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text_delta" && data.text) {
                  fullText += data.text;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, content: fullText }];
                    }
                    return [...prev, { role: "assistant", content: fullText }];
                  });
                } else if (data.type === "message_stop") {
                  break;
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }

      const promptMatch = fullText.match(
        /---PROMPT_READY---([\s\S]*?)---PROMPT_END---/
      );
      if (promptMatch) {
        const prompt = promptMatch[1].trim();
        setCompletedPrompt(prompt);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (finalPrompt: string) => {
    await addToHistory({
      title: messages.find((m) => m.role === "user")?.content?.slice(0, 50) ?? "ヒアリングで生成",
      goal: messages.find((m) => m.role === "user")?.content ?? "",
      category: "other",
      tone: "professional",
      outputFormat: "text",
      generatedPrompt: finalPrompt,
      generationMode: "hearing",
      isFavorite: false,
    });
    toast.success("履歴に保存しました");
    handleReset();
  };

  const handleReset = () => {
    setMessages([{ role: "assistant", content: INITIAL_QUESTION }]);
    setCompletedPrompt(null);
  };

  if (completedPrompt) {
    return (
      <PromptPreview
        prompt={completedPrompt}
        onConfirm={handleConfirm}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">ヒアリングモード</h2>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          最初からやり直す
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-muted/20">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="回答を入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
