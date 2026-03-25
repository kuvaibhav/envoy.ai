# envoy.ai — Planning Document

## Vision

**envoy.ai** is an interactive, LLM-backed portfolio website that acts as a "digital envoy" — a conversational agent that represents you 24/7. Visitors can ask questions about your experience, skills, and projects, and get intelligent, contextual answers grounded in your actual resume and portfolio data.

**Long-term goal:** A platform where anyone can host their own AI-powered portfolio.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         Next.js 14 + TypeScript + Tailwind       │
│                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Hero /   │  │  Chat        │  │ Prompt    │  │
│  │  Landing  │  │  Interface   │  │ Starters  │  │
│  └──────────┘  └──────┬───────┘  └───────────┘  │
│                       │                          │
└───────────────────────┼──────────────────────────┘
                        │ API Routes
                        ▼
┌─────────────────────────────────────────────────┐
│                Backend (Next.js API)             │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  RAG Pipeline │  │  LLM Integration       │   │
│  │  (LangChain)  │  │  (Google Gemini Flash) │   │
│  └──────┬───────┘  └────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Vector DB    │  │  Document Store         │   │
│  │  (Chroma /    │  │  (Resume, CV, images,   │   │
│  │   Supabase)   │  │   project descriptions) │   │
│  └──────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack Decisions

### 1. Frontend — Next.js 14 + TypeScript + Tailwind CSS

**Why Next.js?**
- Server-side rendering for SEO (portfolio needs to be discoverable)
- API routes built-in (no separate backend needed)
- App Router with streaming support (critical for LLM response streaming)
- Huge ecosystem, great DX

**Why Tailwind CSS?**
- Utility-first = fast, consistent styling without bloat
- Pairs well with shadcn/ui for polished, minimal components
- Easy dark mode support
- Not "crowded" — you control exactly what you use

**UI Library: shadcn/ui**
- Not a full component library — it copies components into your project
- Clean, minimal, accessible components
- Customizable without fighting a framework
- Great chat/dialog primitives

### 2. LLM — Google Gemini 2.0 Flash (Primary) + Fallback Options

#### Option Analysis

| Provider | Model | Free Tier | Quality | Speed | Best For |
|----------|-------|-----------|---------|-------|----------|
| **Google Gemini** | Gemini 2.0 Flash | **15 RPM, 1M TPM free** | Good | Fast | ✅ Primary choice |
| Groq | Llama 3.3 70B | 30 RPM free | Good | Very Fast | Fallback |
| Cloudflare Workers AI | Various | 10K tokens/day free | Decent | Moderate | Edge deployment |
| Ollama (self-hosted) | Llama 3.x | Unlimited (your hardware) | Good | Depends | Local dev |
| OpenRouter | Various | Pay-per-use, some free | Varies | Varies | Multi-model routing |

**Recommendation: Google Gemini 2.0 Flash (free tier)**
- 15 requests/minute, 1 million tokens/minute — very generous for a portfolio site
- Good quality for conversational Q&A
- Supports grounding with provided context (perfect for RAG)
- Official `@google/generative-ai` SDK for JavaScript
- Fallback: Groq (Llama 3.3 70B) as secondary — also free, blazing fast

### 3. RAG Pipeline — LangChain.js + Vector Store

**Do we need LangChain?** Yes, but the lightweight JS version.

**Why LangChain.js?**
- Document loaders (PDF, text, markdown)
- Text splitters (chunk your resume intelligently)
- Vector store integrations
- Retrieval chain abstractions
- Works natively in Next.js API routes

**Alternative considered: Vercel AI SDK**
- Great for streaming chat UI, but weaker RAG primitives
- **Verdict:** Use Vercel AI SDK for the *frontend streaming* + LangChain for the *backend RAG pipeline*

### 4. Vector Database — Options

| Option | Free Tier | Hosting | Best For |
|--------|-----------|---------|----------|
| **Chroma** (in-process) | Unlimited (local) | Self-hosted / embedded | MVP / small scale |
| **Supabase pgvector** | 500MB free | Managed | Production, also stores docs |
| Pinecone | 100K vectors free | Managed | Pure vector search |
| Qdrant Cloud | 1GB free | Managed | High performance |

**Phase 1 (MVP):** Chroma embedded — runs in-process, zero cost, no external dependency.
**Phase 2 (Production):** Migrate to Supabase pgvector — acts as both document store AND vector DB, generous free tier, also gives you auth for multi-user later.

### 5. Document / Knowledge Store

Your RAG knowledge base will include:
- **Resume PDF** → parsed, chunked, embedded
- **Project descriptions** → markdown files with detailed write-ups
- **Skills & experience** → structured data (JSON/YAML)
- **Images** → stored as assets, referenced in responses (not embedded in vectors)
- **Custom Q&A pairs** → curated answers for common questions

**Storage approach:**
- Phase 1: Local filesystem (`/data` directory with markdown + JSON files)
- Phase 2: Supabase (structured data + file storage)

### 6. Deployment

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | 100GB bandwidth, serverless functions | ✅ Primary — native Next.js support |
| Cloudflare Pages | Unlimited bandwidth | Alternative |
| Railway | $5 credit/month | If we need a persistent process |

**Recommendation: Vercel (free tier)**
- Zero-config Next.js deployment
- Edge functions for low-latency LLM calls
- Built-in analytics
- Custom domain support
- GitHub integration for CI/CD

---

## Application Structure

```
envoy.ai/
├── .cursor/
│   └── PLANNING.md              # This file
├── data/                         # Knowledge base for RAG
│   ├── resume/
│   │   └── Kumar-Vaibhav-Resume-2026.pdf
│   ├── projects/                 # Detailed project write-ups (markdown)
│   │   ├── agentforce.md
│   │   ├── high-scale-objects.md
│   │   ├── copy-field-enrichment.md
│   │   └── virtual-entity-framework.md
│   ├── profile.json              # Structured profile data
│   └── qa-pairs.json             # Curated Q&A for grounding
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing / Hero
│   │   ├── chat/
│   │   │   └── page.tsx          # Chat interface
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts      # Chat endpoint (streaming)
│   │       └── ingest/
│   │           └── route.ts      # Document ingestion endpoint
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   ├── hero.tsx              # Landing section
│   │   ├── chat-interface.tsx    # Main chat component
│   │   ├── prompt-starters.tsx   # Suggested question chips
│   │   ├── message-bubble.tsx    # Chat message display
│   │   └── navbar.tsx
│   ├── lib/
│   │   ├── rag/
│   │   │   ├── embeddings.ts     # Embedding generation
│   │   │   ├── vectorstore.ts    # Vector store operations
│   │   │   ├── retriever.ts      # Document retrieval
│   │   │   └── chain.ts          # RAG chain composition
│   │   ├── llm/
│   │   │   ├── gemini.ts         # Gemini client
│   │   │   └── prompts.ts        # System prompts & templates
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── scripts/
│   └── ingest.ts                 # Script to process & embed documents
├── public/
│   ├── images/                   # Profile photo, project screenshots
│   └── favicon.ico
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## UI Design Concept

### Landing Page
- Clean, minimal hero with your name and a one-liner tagline
- Subtle animated gradient or mesh background (not distracting)
- Smooth scroll into the chat interface
- Dark mode by default (modern, developer-focused feel)

### Chat Interface
- Central chat area with streaming message display
- **Prompt starters** displayed as clickable chips/cards:
  - "What is Kumar's experience with Java?"
  - "What has Kumar done as a Technical Consultant?"
  - "Can someone provide a reference for Kumar's work?"
  - "Tell me about Kumar's work on AI agents at Salesforce"
  - "What's Kumar's education background?"
- Typing indicator while LLM responds
- Messages rendered with markdown support (for formatted answers)
- Subtle "Powered by envoy.ai" footer

### Design Principles
- **Minimalist**: Lots of whitespace, limited color palette
- **Dark mode first**: Deep navy/charcoal with accent colors
- **Typography-driven**: Clean sans-serif, good hierarchy
- **Responsive**: Mobile-first, works on all devices

---

## RAG Strategy

### Document Processing Pipeline
1. **Parse** resume PDF → extract text
2. **Chunk** text into semantic sections (work experience, education, skills, projects)
3. **Enrich** with structured metadata (company, role, dates, technologies)
4. **Embed** chunks using Gemini embedding model (free) or `all-MiniLM-L6-v2` via Transformers.js
5. **Store** vectors in Chroma (Phase 1) / Supabase pgvector (Phase 2)

### Retrieval Strategy
- Retrieve top-k (3-5) most relevant chunks for each query
- Include structured profile data as always-present context
- System prompt establishes persona: "You are Kumar's digital envoy..."

### System Prompt (Draft)
```
You are envoy.ai — Kumar Vaibhav's digital representative. You answer questions
about Kumar's professional experience, skills, projects, and background based on
the provided context. Be conversational, professional, and accurate. If you don't
have information to answer a question, say so honestly. Never fabricate details.
Speak in third person about Kumar unless the visitor asks you to role-play as him.
```

---

## Phased Roadmap

### Phase 1 — MVP (Current Sprint)
- [x] Project setup (Next.js + TypeScript + Tailwind + shadcn/ui)
- [ ] Landing page with hero section
- [ ] Chat interface with prompt starters
- [ ] Gemini Flash integration (direct API, no RAG yet)
- [ ] Hardcoded resume context in system prompt
- [ ] Streaming responses
- [ ] Deploy to Vercel
- **Goal:** Working chat that can answer questions about Kumar

### Phase 2 — RAG Integration
- [ ] Set up LangChain.js RAG pipeline
- [ ] Parse and chunk resume PDF
- [ ] Create detailed project markdown files
- [ ] Set up Chroma vector store
- [ ] Implement retrieval-augmented generation
- [ ] Add curated Q&A pairs for common questions
- **Goal:** Answers grounded in actual documents, not just system prompt

### Phase 3 — Polish & Production
- [ ] Migrate to Supabase (pgvector + file storage)
- [ ] Add profile images and project screenshots
- [ ] Conversation memory (session-based)
- [ ] Rate limiting and abuse protection
- [ ] Analytics (track common questions)
- [ ] SEO optimization
- [ ] Custom domain setup
- **Goal:** Production-ready portfolio

### Phase 4 — Multi-User Platform (Long-term)
- [ ] User authentication (Supabase Auth)
- [ ] Onboarding flow: upload resume → auto-generate portfolio
- [ ] Custom themes/branding per user
- [ ] Admin dashboard
- [ ] Usage analytics per portfolio
- **Goal:** Platform where anyone can create their AI portfolio

---

## Key Dependencies

```json
{
  "core": {
    "next": "^14.x",
    "react": "^18.x",
    "typescript": "^5.x"
  },
  "ui": {
    "tailwindcss": "^3.x",
    "shadcn/ui": "latest",
    "lucide-react": "icons",
    "framer-motion": "animations"
  },
  "ai": {
    "@google/generative-ai": "Gemini SDK",
    "ai": "Vercel AI SDK (streaming)",
    "langchain": "RAG pipeline (Phase 2)",
    "@langchain/google-genai": "LangChain Gemini integration",
    "chromadb": "Vector store (Phase 2)"
  }
}
```

---

## Cost Analysis

| Component | Phase 1 | Phase 2+ | Notes |
|-----------|---------|----------|-------|
| LLM (Gemini Flash) | **$0** | **$0** | 15 RPM free tier is plenty for a portfolio |
| Hosting (Vercel) | **$0** | **$0** | Free tier: 100GB bandwidth |
| Vector DB (Chroma) | **$0** | **$0** | Embedded, runs in-process |
| Vector DB (Supabase) | — | **$0** | 500MB free tier |
| Domain | ~$12/yr | ~$12/yr | Optional |
| **Total** | **$0** | **$0-12/yr** | |

---

## Open Questions

1. **Embedding model choice:** Gemini embedding API (free, 1500 RPM) vs local model (Transformers.js)?
   - Recommendation: Gemini for simplicity, local for zero-dependency
2. **Conversation memory:** Per-session (simple) vs persistent (needs DB)?
   - Recommendation: Per-session for Phase 1
3. **Multi-language support:** English only for now?
4. **Voice input/output:** Future consideration?
5. **Portfolio sections beyond chat:** Do we want static sections (timeline, skills grid) alongside chat, or is chat the entire experience?

---

## Next Steps

1. Initialize Next.js project with TypeScript + Tailwind
2. Set up shadcn/ui
3. Build landing page and chat interface
4. Integrate Gemini Flash with resume context
5. Deploy MVP to Vercel
