import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">履歴</h1>
        <p className="text-muted-foreground mt-1">
          生成したプロンプトの保存・検索・再利用
        </p>
      </div>
      <HistoryList />
    </div>
  );
}
