import { google } from "@ai-sdk/google";
import {
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { getSystemPrompt } from "@/lib/llm/prompts";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const coreMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content:
      m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || "",
  }));

  const systemPrompt = await getSystemPrompt();

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: google("gemini-2.5-flash-lite"),
        system: systemPrompt,
        messages: coreMessages,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
