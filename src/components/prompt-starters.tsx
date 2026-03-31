"use client";

import { motion } from "framer-motion";
import { Sparkles, Briefcase, Code, GraduationCap, Lightbulb } from "lucide-react";

const prompts = [
  {
    icon: Code,
    text: "What is Kumar's experience with Java?",
  },
  {
    icon: Briefcase,
    text: "What has Kumar done as a Technical Consultant?",
  },
  {
    icon: Sparkles,
    text: "Tell me about Kumar's AI agent work at Salesforce",
  },
  {
    icon: GraduationCap,
    text: "What's Kumar's education background?",
  },
  {
    icon: Lightbulb,
    text: "What projects has Kumar built?",
  },
];

interface PromptStartersProps {
  onSelect: (prompt: string) => void;
}

export function PromptStarters({ onSelect }: PromptStartersProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-4">
      {prompts.map((prompt, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
          onClick={() => onSelect(prompt.text)}
          className="group flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
        >
          <prompt.icon className="h-3.5 w-3.5 text-primary/70 transition-colors group-hover:text-primary" />
          {prompt.text}
        </motion.button>
      ))}
    </div>
  );
}
