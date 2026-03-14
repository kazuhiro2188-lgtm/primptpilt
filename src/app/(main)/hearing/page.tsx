import { MessageCircle } from "lucide-react";
import { ChatInterface } from "@/components/hearing/ChatInterface";

export default function HearingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-7 w-7 text-primary" />
          ヒアリングモード
        </h1>
        <p className="text-muted-foreground mt-1">
          AIとの対話でプロンプトを組み立てる
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
