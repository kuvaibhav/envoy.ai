import { google } from "@ai-sdk/google";
import {
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { SYSTEM_PROMPT } from "@/lib/llm/prompts";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: google("gemini-2.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages,
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
