export interface DiagnoseScore {
  score: number;
  feedback: string;
}

export interface DiagnoseResult {
  totalScore: number;
  maxScore: number;
  scores: {
    specificity: DiagnoseScore;
    structure: DiagnoseScore;
    clarity: DiagnoseScore;
    coverage: DiagnoseScore;
    efficiency: DiagnoseScore;
  };
  overallFeedback: string;
  improvementSuggestions: string[];
}

export const DIAGNOSE_AXES = [
  { key: "specificity" as const, label: "具体性", description: "数値・条件の明示" },
  { key: "structure" as const, label: "構造性", description: "役割・背景・指示・制約・出力" },
  { key: "clarity" as const, label: "明確性", description: "誤解のない表現" },
  { key: "coverage" as const, label: "網羅性", description: "必要な情報の充足" },
  { key: "efficiency" as const, label: "効率性", description: "無駄のない記述" },
] as const;
