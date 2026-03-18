import OpenAI from "openai";
import { META_HEARING_SYSTEM } from "@/lib/prompts/hearing-system";
import { z } from "zod";

const HearingSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
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
    const parsed = HearingSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "無効なリクエストです" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = parsed.data;

    const openai = new OpenAI({ apiKey });

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: META_HEARING_SYSTEM },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      stream: true,
      messages: formattedMessages,
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
    console.error("Hearing API error:", error);
    return new Response(
      JSON.stringify({
        error: "ヒアリングの処理に失敗しました。しばらくしてから再度お試しください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
