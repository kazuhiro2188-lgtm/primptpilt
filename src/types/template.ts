import type { LucideIcon } from "lucide-react";
import type { CategoryId, ToneId, OutputFormatId } from "./prompt";

export interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  subcategory: string;
  icon: LucideIcon;
  variables: TemplateVariable[];
  goalTemplate: string;
  defaultTone: ToneId;
  defaultOutputFormat: OutputFormatId;
}
