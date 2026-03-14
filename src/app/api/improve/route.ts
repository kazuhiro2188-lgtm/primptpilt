import { Anthropic } from "@anthropic-ai/sdk";
import { META_IMPROVE_SYSTEM } from "@/lib/prompts/improve-system";
import { z } from "zod";

const ImproveSchema = z.object({
  prompt: z.string().min(1, "プロンプトを入力してください"),
  instruction: z.string().optional(),
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
    const parsed = ImproveSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message || "バリデーションエラー" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt, instruction } = parsed.data;

    const userMessage = [
      `## 改善対象のプロンプト`,
      "```",
      prompt,
      "```",
      instruction ? `\n## 改善の指示\n${instruction}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const anthropic = new Anthropic({ apiKey });

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: META_IMPROVE_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text_delta", text: event.delta.text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "message_stop" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Improve API error:", error);
    return new Response(
      JSON.stringify({
        error: "プロンプトの改善に失敗しました。しばらくしてから再度お試しください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
