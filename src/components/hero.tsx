"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="flex min-h-[45vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Hi, I&apos;m{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Kumar Vaibhav
          </span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Software Engineer building scalable systems, distributed services, and
          AI-powered experiences. This is my digital envoy — ask it anything
          about my work.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {["Java", "Python", "TypeScript", "Distributed Systems", "AI/ML", "Salesforce"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-accent/50 px-3 py-1"
              >
                {tag}
              </span>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
}
