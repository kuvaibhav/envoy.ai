"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Briefcase,
  Code,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code,
  Briefcase,
  Sparkles,
  GraduationCap,
  Lightbulb,
  MessageSquare,
};

const DEFAULT_PROMPTS = [
  { text: "What is Kumar's experience with Java?", icon: "Code" },
  { text: "What has Kumar done as a Technical Consultant?", icon: "Briefcase" },
  { text: "Tell me about Kumar's AI agent work at Salesforce", icon: "Sparkles" },
  { text: "What's Kumar's education background?", icon: "GraduationCap" },
  { text: "What projects has Kumar built?", icon: "Lightbulb" },
];

interface PromptStartersProps {
  onSelect: (prompt: string) => void;
}

export function PromptStarters({ onSelect }: PromptStartersProps) {
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);

  useEffect(() => {
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        if (data.prompts?.length > 0) {
          setPrompts(
            data.prompts.map((p: { text: string; icon?: string }) => ({
              text: p.text,
              icon: p.icon || "MessageSquare",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4">
      {prompts.map((prompt, i) => {
        const Icon = iconMap[prompt.icon] || MessageSquare;
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            onClick={() => onSelect(prompt.text)}
            className="group flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-primary/70 transition-colors group-hover:text-primary" />
            {prompt.text}
          </motion.button>
        );
      })}
    </div>
  );
}
