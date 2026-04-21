# envoy.ai — Architecture Document

> Last updated: March 2026  
> Status: Phase 1 + Phase 2 complete, deployed on Vercel

---

## 1. Overview

**envoy.ai** is a conversational AI portfolio — a web application that lets visitors ask natural-language questions about Kumar Vaibhav's professional experience, skills, and projects. The system assembles context from a Firebase database at runtime and passes it to Google Gemini for grounded, streaming responses.

### Design Goals
- **Zero hallucination** — the LLM is strictly grounded to data stored in Firestore; it cannot fabricate details
- **Zero recurring cost** — all services used are on free tiers sized for ~50 users
- **Serverless-first** — no persistent backend process; all compute runs in Next.js API routes on Vercel
- **Dynamic data** — resume and portfolio content is stored in Firebase, not hardcoded in source

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│   ┌────────────┐   ┌───────────────────┐   ┌─────────────┐  │
│   │   Hero /   │   │  Chat Interface   │   │  Prompt     │  │
│   │  Landing   │   │  (useChat hook)   │   │  Starters   │  │
│   └────────────┘   └────────┬──────────┘   └──────┬──────┘  │
│                             │ POST /api/chat        │ GET /api/prompts
└─────────────────────────────┼─────────────────────-┼─────────┘
                              │                       │
┌─────────────────────────────┼───────────────────────┼────────┐
│              Next.js API Routes (Vercel Serverless)  │        │
│                             │                       │        │
│   ┌──────────────────────── ▼ ─────────────┐  ┌─────▼─────┐  │
│   │           /api/chat                    │  │/api/prompts│  │
│   │                                        │  │           │  │
│   │  1. Parse incoming UIMessage[]         │  │ Reads     │  │
│   │  2. Fetch system prompt from Firestore │  │ prompts   │  │
│   │  3. Stream via Gemini 2.5 Flash-Lite  │  │ from DB   │  │
│   │  4. Return SSE stream to client        │  └─────┬─────┘  │
│   └──────────────┬─────────────────────────┘        │        │
│                  │                                   │        │
└──────────────────┼───────────────────────────────────┼────────┘
                   │                                   │
        ┌──────────▼───────────────────────────────────▼──────┐
        │                  Firebase                            │
        │                                                      │
        │   ┌──────────────────────┐  ┌──────────────────────┐ │
        │   │      Firestore       │  │    Cloud Storage      │ │
        │   │                      │  │                       │ │
        │   │  users/{id}/         │  │  uploads/{id}/        │ │
        │   │    profile/main      │  │    resumes/           │ │
        │   │    resumes/current   │  │      current.pdf      │ │
        │   │    resumes/master    │  │      master.pdf       │ │
        │   │    prompts/{0-4}     │  │                       │ │
        │   │    documents/        │  └──────────────────────┘ │
        │   │      research_paper  │                            │
        │   │      cover_letter    │                            │
        │   └──────────────────────┘                            │
        └──────────────────────────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────────────┐
        │          Google Gemini 2.5 Flash-Lite (External)     │
        │          Free tier: 15 RPM, 1M tokens/min            │
        └─────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.x | SSR, API routes, streaming built-in |
| Language | TypeScript | 5.x | Type safety across full stack |
| Styling | Tailwind CSS | 4.x | Utility-first, no runtime overhead |
| Animations | Framer Motion | latest | Smooth page transitions and chat entry |
| Icons | Lucide React | latest | Lightweight, consistent icon set |
| AI SDK | Vercel AI SDK (`ai`) | 6.x | Streaming abstraction, `useChat` hook |
| LLM Provider | `@ai-sdk/google` | 3.x | Google Gemini integration |
| Client Streaming | `@ai-sdk/react` | 3.x | `useChat` hook for SSE consumption |
| LLM Model | Gemini 2.5 Flash-Lite | — | Free tier, fast, sufficient quality |
| Database | Firebase Firestore | 11.x | NoSQL, serverless-friendly, free tier |
| File Storage | Firebase Cloud Storage | 11.x | Blob storage for PDF uploads |
| Hosting | Vercel | — | Native Next.js, serverless, free tier |
| Testing | Vitest | latest | Fast unit/integration tests |

---

## 4. Project Structure

```
envoy.ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout, Inter font, metadata
│   │   ├── page.tsx                    # Composes MeshGradient, Navbar, Hero, ChatInterface
│   │   ├── globals.css                 # Tailwind imports, dark theme variables, scrollbar
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts            # POST — streaming chat endpoint
│   │       └── prompts/
│   │           └── route.ts            # GET — fetch prompt starters from Firestore
│   ├── components/
│   │   ├── mesh-gradient.tsx           # Animated background (client component)
│   │   ├── navbar.tsx                  # Fixed top nav with GitHub/LinkedIn links
│   │   ├── hero.tsx                    # Name, tagline, skill tags with animations
│   │   ├── chat-interface.tsx          # Full chat UI — input, message list, streaming
│   │   └── prompt-starters.tsx         # Clickable prompt chips, fetched from Firestore
│   └── lib/
│       ├── firebase/
│       │   ├── config.ts               # Firebase app initialization (singleton)
│       │   └── firestore.ts            # Typed CRUD + assembleLLMContext()
│       ├── llm/
│       │   └── prompts.ts              # buildSystemPrompt(), getSystemPrompt()
│       └── utils.ts                    # cn() class name utility
├── scripts/
│   └── seed-firestore.ts               # Local-only migration script (gitignored)
├── src/__tests__/
│   └── chat-api.test.ts                # Vitest integration tests for /api/chat
├── .env.local                          # API keys (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── PLANNING.md
```

---

## 5. Data Flow — Chat Request (Detailed)

This is what happens on every chat message end-to-end:

```
User types message → clicks Send
        │
        ▼
[chat-interface.tsx]
  sendMessage({ text: messageText })          ← Vercel AI SDK useChat hook
        │
        ▼ POST /api/chat
  Body: { messages: UIMessage[] }             ← Full conversation history (UIMessage format)
        │
        ▼
[src/app/api/chat/route.ts]
  1. Parse UIMessage[] → CoreMessage[]
     - Extract text from message.parts (AI SDK v6 format)
     - Map to { role: "user"|"assistant", content: string }

  2. getSystemPrompt() → calls assembleLLMContext()
     │
     ▼
  [src/lib/llm/prompts.ts + src/lib/firebase/firestore.ts]
     assembleLLMContext() runs 3 parallel Firestore reads:
       ├── getProfile()          → name, tagline, email, bio, social links
       ├── getAllResumes()        → current and master resume text
       └── getUserDocument() ×2  → research paper, cover letter text
     
     Assembled into one context string → passed to buildSystemPrompt()
     
     System prompt = persona instructions + full profile context

  3. streamText({
       model: google("gemini-2.5-flash-lite"),
       system: <assembled system prompt>,
       messages: <CoreMessage[]>
     })
     
  4. createUIMessageStream + createUIMessageStreamResponse
     → Returns SSE stream to the browser
        │
        ▼
[chat-interface.tsx]
  useChat hook receives SSE chunks
  → Appends tokens to message.parts in real time
  → React re-renders streaming text as it arrives
  → isLoading bouncing dots shown until status changes from "streaming"
```

---

## 6. Firestore Schema

All data is nested under a user document. Currently using a static slug `kumar-vaibhav` as the user ID.

```
users/
└── {userId}/                        (e.g. "kumar-vaibhav")
    ├── profile/
    │   └── main                     (single document)
    │       ├── name: string
    │       ├── email: string
    │       ├── tagline: string
    │       ├── githubUrl: string
    │       ├── linkedinUrl: string
    │       ├── personalDescription: string
    │       └── updatedAt: timestamp
    │
    ├── resumes/                      (subcollection, max 2 docs)
    │   ├── current
    │   │   ├── type: "current"
    │   │   ├── fileName: string
    │   │   ├── textContent: string   ← what the LLM reads
    │   │   ├── fileUrl?: string      ← Cloud Storage download URL
    │   │   ├── fileSizeBytes: number
    │   │   └── updatedAt: timestamp
    │   └── master
    │       └── (same shape as current)
    │
    ├── prompts/                      (subcollection, max 5 docs)
    │   └── {promptId}               (e.g. "prompt-0" … "prompt-4")
    │       ├── text: string
    │       ├── icon: string          ← Lucide icon name
    │       ├── order: number         ← display order (0–4)
    │       └── createdAt: timestamp
    │
    └── documents/                   (subcollection)
        ├── research_paper
        │   ├── type: "research_paper"
        │   ├── title: string
        │   ├── textContent: string
        │   └── updatedAt: timestamp
        └── cover_letter
            ├── type: "cover_letter"
            ├── title: string
            ├── textContent: string
            └── updatedAt: timestamp
```

**Cloud Storage layout:**
```
uploads/{userId}/
└── resumes/
    ├── current.pdf
    └── master.pdf
```

**Key design decisions:**
- Text content is stored separately from the PDF blob. The LLM reads text from Firestore; PDFs sit in Cloud Storage for download links only. This keeps chat requests fast.
- `orderBy("order", "asc")` on prompts subcollection ensures consistent display ordering.
- Security rules currently allow read/write for all during development (expires April 30, 2026).

---

## 7. LLM Integration

### Model
**Google Gemini 2.5 Flash-Lite** via `@ai-sdk/google`.

Free tier limits (more than sufficient for a portfolio at ~50 users):
- 15 requests per minute
- 1,000,000 tokens per minute

### Prompt Architecture

The system prompt is assembled dynamically on every request:

```
[Persona instructions]
You are envoy.ai — a digital representative for the person described below.
Answer questions about their professional experience, skills, education, and projects.
Rules: no fabrication, third-person, redirect off-topic questions, cite impact metrics.

[Context block — assembled from Firestore]
NAME: Kumar Vaibhav
EMAIL: ...
TAGLINE: ...
PERSONAL DESCRIPTION: ...

CURRENT RESUME:
<full resume text>

RESEARCH PAPER — Design of Out-of-Order Floating-Point Unit:
<paper abstract>
```

### Streaming

Uses the Vercel AI SDK's streaming primitives (AI SDK v6 API):
- Server: `streamText` → `createUIMessageStream` → `createUIMessageStreamResponse`
- Client: `useChat` hook from `@ai-sdk/react` consumes SSE and updates `message.parts` incrementally

The `UIMessage` ↔ `CoreMessage` conversion is done in `chat/route.ts` because the AI SDK v6 sends messages in `parts[]` format on the wire but `streamText` expects the `CoreMessage` format with a `content` string.

---

## 8. Frontend Components

### Component Tree

```
page.tsx
├── MeshGradient          (client) — animated CSS gradient background
├── Navbar                (server) — fixed top bar, GitHub/LinkedIn links
├── Hero                  (client) — name, tagline, skill tags, framer-motion animations
└── ChatInterface         (client) — full chat UI
    └── PromptStarters    (client) — fetches /api/prompts, renders clickable chips
```

### ChatInterface State

Managed entirely by `useChat` from `@ai-sdk/react`:
- `messages` — conversation history with `parts[]`
- `sendMessage({ text })` — sends a new user message and starts streaming
- `setMessages([])` — clears chat (used by the Clear chat button)
- `status` — `"idle" | "submitted" | "streaming" | "error"` — controls loading indicator
- `error` — renders an inline error message if the API call fails

Local state:
- `input` (useState) — the textarea value, managed separately from `useChat`

### PromptStarters

On mount, fetches `GET /api/prompts` from Firestore. Falls back to 3 hardcoded defaults if the fetch fails or returns empty. Each prompt is mapped to a Lucide icon by name.

---

## 9. API Routes

### `POST /api/chat`

**Purpose:** Accepts the conversation history, assembles the system prompt from Firestore, and streams a Gemini response back.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "parts": [{ "type": "text", "text": "What is Kumar's Java experience?" }] }
  ]
}
```

**Response:** `text/event-stream` (SSE) — streamed tokens in Vercel AI SDK format.

**Error handling:** Errors from Gemini or Firestore propagate as HTTP 500 and are caught by `useChat`'s `error` state.

---

### `GET /api/prompts`

**Purpose:** Returns the list of prompt starters for the landing page.

**Response:**
```json
{
  "prompts": [
    { "id": "prompt-0", "text": "What is Kumar's experience with Java?", "icon": "Code", "order": 0 },
    ...
  ]
}
```

**Error handling:** Returns `{ prompts: [], error: "..." }` with HTTP 500 on failure. The frontend falls back to hardcoded defaults.

---

## 10. Environment Configuration

| Variable | Used By | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `@ai-sdk/google` (server-side) | Gemini API key — never exposed to browser |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase SDK (client + server) | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase SDK | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase SDK | Firestore project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase SDK | Cloud Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase SDK | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase SDK | Web app registration ID |

All stored in `.env.local` locally and in Vercel's Environment Variables panel for production.

> **Security note:** `NEXT_PUBLIC_*` variables are exposed to the browser. This is intentional and standard for Firebase — Firebase security rules (not the API key) control access. The Gemini key has no `NEXT_PUBLIC_` prefix and stays server-only.

---

## 11. Testing

Integration tests in `src/__tests__/chat-api.test.ts` using **Vitest**.

Tests cover:
- Simple greeting responses
- Specific technical questions (Java experience, Salesforce AI agent work)
- Education background queries
- Consulting history queries
- Multi-turn conversation context retention
- Off-topic question redirection

Run with:
```bash
npm test            # run once
npm run test:watch  # watch mode
```

---

## 12. Deployment

Hosted on **Vercel** (free tier).

**Build pipeline:**
```
git push → GitHub → Vercel detects push → npm run build → deploys to CDN + serverless
```

**Key deployment notes:**
- All environment variables must be added in Vercel dashboard → Project → Settings → Environment Variables
- `package-lock.json` is committed — ensures reproducible installs on Vercel build servers
- `scripts/` is gitignored — the seed script never deploys
- `.next/`, `node_modules/` are gitignored — Vercel rebuilds these fresh on every deploy

**Free tier limits (Vercel Hobby):**
- 100 GB bandwidth/month
- 100 GB-hours serverless compute
- No persistent servers — functions cold-start on first request (~200–400ms)

---

## 13. Known Limitations & Future Work

| Area | Current State | Phase 4 Plan |
|---|---|---|
| User IDs | Hardcoded slug `"kumar-vaibhav"` | Firebase Auth UIDs per user |
| PDF upload | Text seeded manually via local script | Admin UI for PDF upload + server-side text extraction |
| RAG | Full resume text injected as context (no chunking/retrieval) | LangChain.js + vector store (Firestore vector search or Supabase pgvector) |
| Conversation memory | In-memory per session only (lost on refresh) | Optional persistent history in Firestore |
| Rate limiting | None | Vercel Edge middleware rate limiting by IP |
| Security rules | Permissive test mode (expires Apr 30, 2026) | Role-based rules tied to Firebase Auth |
| Multi-user | Single hardcoded user | Onboarding flow, per-user data isolation |

---

## 14. Cost Summary

| Service | Free Tier | Current Usage | Status |
|---|---|---|---|
| Google Gemini 2.5 Flash-Lite | 15 RPM, 1M TPM | << 1 RPM | ✅ Free |
| Firebase Firestore | 50K reads/day, 1 GiB storage | ~1.3 MB total | ✅ Free |
| Firebase Cloud Storage | 5 GB, 1 GB/day download | < 50 MB | ✅ Free |
| Vercel Hobby | 100 GB bandwidth | Minimal | ✅ Free |
| **Total** | | | **$0/month** |
