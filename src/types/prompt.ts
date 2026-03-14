export type CategoryId =
  | "business"
  | "marketing"
  | "coding"
  | "writing"
  | "analysis"
  | "other";

export type ToneId = "professional" | "casual" | "creative" | "academic";

export type OutputFormatId =
  | "text"
  | "list"
  | "table"
  | "json"
  | "markdown";

export interface GenerateInput {
  goal: string;
  category: CategoryId;
  tone: ToneId;
  outputFormat: OutputFormatId;
  audience?: string;
  extra?: string;
}

export interface PromptHistory {
  id: string;
  title: string;
  goal: string;
  category: CategoryId;
  tone: ToneId;
  outputFormat: OutputFormatId;
  audience?: string;
  extra?: string;
  generatedPrompt: string;
  generationMode: "quick" | "hearing" | "template" | "improve";
  isFavorite: boolean;
  createdAt: string;
}
