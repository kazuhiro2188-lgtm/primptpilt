import { DiagnoseForm } from "@/components/diagnose/DiagnoseForm";

export default function DiagnosePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">プロンプト診断</h1>
        <p className="text-muted-foreground mt-1">
          既存のプロンプトの品質を診断し、改善ポイントを把握する
        </p>
      </div>
      <DiagnoseForm />
    </div>
  );
}
