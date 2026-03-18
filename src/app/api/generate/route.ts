import OpenAI from "openai";
import { META_GENERATE_SYSTEM } from "@/lib/prompts/meta-system";
import { z } from "zod";

const GenerateSchema = z.object({
  goal: z.string().min(1, "やりたいことを入力してください"),
  category: z.string(),
  tone: z.string(),
  outputFormat: z.string(),
  audience: z.string().optional(),
  extra: z.string().optional(),
});

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "APIキーが設定されていません（OPENAI_API_KEY）" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const parsed = GenerateSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message || "バリデーションエラー" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { goal, category, tone, outputFormat, audience, extra } = parsed.data;

    const userMessage = [
      `## ユーザーの要望`,
      `やりたいこと: ${goal}`,
      `カテゴリ: ${category}`,
      `トーン: ${tone}`,
      `出力形式: ${outputFormat}`,
      audience ? `対象: ${audience}` : null,
      extra ? `追加要望: ${extra}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: "system", content: META_GENERATE_SYSTEM },
        { role: "user", content: userMessage },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text_delta", text })}\n\n`
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
    console.error("Generate API error:", error);
    return new Response(
      JSON.stringify({
        error: "プロンプトの生成に失敗しました。しばらくしてから再度お試しください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
