import { describe, it, expect } from "vitest";

const API_URL = "http://localhost:3000/api/chat";

function makeMessage(role: string, text: string, id?: string) {
  return {
    id: id || Math.random().toString(36).slice(2),
    role,
    parts: [{ type: "text", text }],
  };
}

async function fetchChat(messages: ReturnType<typeof makeMessage>[]) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return res;
}

function parseSSEChunks(raw: string): Array<Record<string, unknown>> {
  return raw
    .split("\n")
    .filter((line) => line.startsWith("data: ") && line !== "data: [DONE]")
    .map((line) => JSON.parse(line.slice(6)));
}

function extractText(chunks: Array<Record<string, unknown>>): string {
  return chunks
    .filter((c) => c.type === "text-delta")
    .map((c) => c.delta as string)
    .join("");
}

describe("Chat API - /api/chat", () => {
  it("returns 200 and streams a response for a simple greeting", async () => {
    const res = await fetchChat([makeMessage("user", "Hello")]);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");

    const body = await res.text();
    const chunks = parseSSEChunks(body);
    const text = extractText(chunks);

    expect(text.length).toBeGreaterThan(0);
    expect(chunks.some((c) => c.type === "start")).toBe(true);
    expect(chunks.some((c) => c.type === "finish")).toBe(true);
  });

  it("answers questions about Kumar's Java experience", async () => {
    const res = await fetchChat([
      makeMessage("user", "What is Kumar's experience with Java?"),
    ]);
    expect(res.status).toBe(200);

    const text = extractText(parseSSEChunks(await res.text()));
    const lower = text.toLowerCase();
    expect(lower).toContain("java");
    expect(lower).toMatch(/salesforce|rabbitmq|ingestion|junit/);
  });

  it("answers questions about Kumar's education", async () => {
    const res = await fetchChat([
      makeMessage("user", "What is Kumar's education background?"),
    ]);
    expect(res.status).toBe(200);

    const text = extractText(parseSSEChunks(await res.text()));
    const lower = text.toLowerCase();
    expect(lower).toContain("irvine");
    expect(lower).toMatch(/master|computer science/);
  });

  it("answers questions about consulting experience", async () => {
    const res = await fetchChat([
      makeMessage("user", "What has Kumar done as a Technical Consultant?"),
    ]);
    expect(res.status).toBe(200);

    const text = extractText(parseSSEChunks(await res.text()));
    const lower = text.toLowerCase();
    expect(lower).toMatch(/deloitte|plauzzable/);
  });

  it("handles multi-turn conversations", async () => {
    const res = await fetchChat([
      makeMessage("user", "What does Kumar do?"),
      makeMessage(
        "assistant",
        "Kumar is a Software Engineer at Salesforce."
      ),
      makeMessage("user", "Tell me about his AI-related work"),
    ]);
    expect(res.status).toBe(200);

    const text = extractText(parseSSEChunks(await res.text()));
    const lower = text.toLowerCase();
    expect(lower).toMatch(/agentforce|agent|enrichment/);
  });

  it("stays on topic for unrelated questions", async () => {
    const res = await fetchChat([
      makeMessage("user", "What is the weather today?"),
    ]);
    expect(res.status).toBe(200);

    const text = extractText(parseSSEChunks(await res.text()));
    const lower = text.toLowerCase();
    expect(lower).toMatch(/kumar|professional|experience|portfolio|help/);
  });
});
