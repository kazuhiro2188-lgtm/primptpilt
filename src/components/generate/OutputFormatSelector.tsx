"use client";

import { OUTPUT_FORMATS } from "@/lib/constants";
import type { OutputFormatId } from "@/types/prompt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OutputFormatSelectorProps {
  value: OutputFormatId;
  onChange: (value: OutputFormatId) => void;
}

export function OutputFormatSelector({ value, onChange }: OutputFormatSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as OutputFormatId)}>
      <SelectTrigger>
        <SelectValue placeholder="出力形式を選択" />
      </SelectTrigger>
      <SelectContent>
        {OUTPUT_FORMATS.map((fmt) => (
          <SelectItem key={fmt.id} value={fmt.id}>
            {fmt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
