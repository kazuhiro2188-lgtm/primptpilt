import { Anthropic } from "@anthropic-ai/sdk";
import { META_DIAGNOSE_SYSTEM } from "@/lib/prompts/diagnose-system";
import { z } from "zod";

const DiagnoseSchema = z.object({
  prompt: z.string().min(1, "プロンプトを入力してください"),
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "APIキーが設定されていません" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const parsed = DiagnoseSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message || "バリデーションエラー" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt } = parsed.data;

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: META_DIAGNOSE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `以下のプロンプトを診断してください。\n\n---\n${prompt}\n---`,
        },
      ],
    });

    const text = message.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    // JSONを抽出（```json ... ``` で囲まれている場合も対応）
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      const braceStart = jsonStr.indexOf("{");
      const braceEnd = jsonStr.lastIndexOf("}") + 1;
      if (braceStart >= 0 && braceEnd > braceStart) {
        jsonStr = jsonStr.slice(braceStart, braceEnd);
      }
    }

    const result = JSON.parse(jsonStr);

    // バリデーション: 必須フィールドの存在確認
    const required = ["totalScore", "maxScore", "scores", "overallFeedback", "improvementSuggestions"];
    const scoreKeys = ["specificity", "structure", "clarity", "coverage", "efficiency"];
    for (const key of required) {
      if (!(key in result)) {
        throw new Error(`診断結果に ${key} が含まれていません`);
      }
    }
    for (const key of scoreKeys) {
      if (!(key in result.scores) || typeof result.scores[key].score !== "number") {
        throw new Error(`診断結果の scores.${key} が不正です`);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Diagnose API error:", error);
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: "診断結果の解析に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        error: "プロンプトの診断に失敗しました。しばらくしてから再度お試しください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
