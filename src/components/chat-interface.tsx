"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, RotateCcw } from "lucide-react";
import { PromptStarters } from "./prompt-starters";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { messages, sendMessage, setMessages, status, error } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    setInput("");
    sendMessage({ text: messageText });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-6">
      {!hasMessages && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Try asking me something:
          </p>
          <PromptStarters onSelect={(prompt) => handleSend(prompt)} />
        </motion.div>
      )}

      {hasMessages && (
        <div
          className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-sm"
          style={{ maxHeight: "50vh" }}
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setMessages([])}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
            >
              <RotateCcw className="h-3 w-3" />
              Clear chat
            </button>
          </div>
          <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {message.parts
                    ?.filter((part) => part.type === "text")
                    .map((part, i) => (
                      <span key={i}>{(part as { type: "text"; text: string }).text}</span>
                    ))}
                </div>
                {message.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex gap-1 rounded-2xl bg-accent px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </motion.div>
            )}

          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              Something went wrong. Please try again.
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-sm transition-colors focus-within:border-primary/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Kumar..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground/50">
          Powered by envoy.ai — Kumar&apos;s digital representative
        </p>
      </div>
    </section>
  );
}
