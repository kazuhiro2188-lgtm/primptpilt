import type { CategoryId, ToneId, OutputFormatId } from "./prompt";

export interface GenerateRequest {
  goal: string;
  category: CategoryId;
  tone: ToneId;
  outputFormat: OutputFormatId;
  audience?: string;
  extra?: string;
}

export interface HearingRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}
