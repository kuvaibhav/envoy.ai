# envoy.ai

**Your resume, but conversational.**

envoy.ai is an open-source AI portfolio template that turns your static resume into an interactive agent — one that answers questions about your experience, skills, and projects in real time, 24/7.

Instead of asking recruiters or visitors to read through a PDF, let them have a conversation.

---

## What it does

- Visitors land on your page and can immediately ask questions like *"What's your experience with distributed systems?"* or *"Tell me about your most impactful project"*
- An LLM (Google Gemini) answers — grounded strictly in your data, no hallucinations
- Everything streams in real time with a clean, minimal chat UI
- Prompt starters on the landing page guide visitors toward the best questions to ask

---

## How it works

```
Visitor asks a question
        ↓
Next.js API route fetches your profile + resume from Firestore
        ↓
Assembles a grounded system prompt (your data, not the LLM's imagination)
        ↓
Streams a response back via Google Gemini
        ↓
Visitor gets a real answer about you, instantly
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| AI SDK | Vercel AI SDK v6 |
| LLM | Google Gemini 2.5 Flash-Lite |
| Database | Firebase Firestore |
| File Storage | Firebase Cloud Storage |
| Hosting | Vercel |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/your-username/envoy.ai.git
cd envoy.ai
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

- **Gemini API key** — [Google AI Studio](https://aistudio.google.com/app/apikey) (free tier)
- **Firebase credentials** — [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your apps

### 3. Seed your data into Firestore

Fill in your details in `scripts/seed-firestore.ts` (look for the `TODO:` markers), then run:

```bash
npm run seed
```

This writes your profile, resume text, and prompt starters into Firestore.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## License

MIT — fork it, personalise it, make it yours.
