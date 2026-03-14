import { Anthropic } from "@anthropic-ai/sdk";
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "APIキーが設定されていません" }),
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

    const anthropic = new Anthropic({ apiKey });

    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: META_HEARING_SYSTEM,
      messages: formattedMessages,
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
    console.error("Hearing API error:", error);
    return new Response(
      JSON.stringify({
        error: "ヒアリングの処理に失敗しました。しばらくしてから再度お試しください。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
