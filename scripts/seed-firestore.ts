/**
 * One-time seed script — populates Firestore with your portfolio data.
 *
 * Usage:
 *   1. Fill in every placeholder marked with TODO below.
 *   2. Make sure .env.local is present with your Firebase credentials.
 *   3. Run: npm run seed
 *
 * Firebase credentials are read exclusively from .env.local — no secrets
 * are hardcoded here. .env.local is gitignored and never committed.
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// TODO: Set this to your Firestore user document ID (e.g. "your-name")
const USER_ID = "your-user-id";

// TODO: Paste your full resume as plain text.
// Tip: copy from your PDF, clean up formatting, and paste here.
const RESUME_TEXT = `
TODO: Paste your resume text here.
`;

// TODO: Paste the full text of your research paper / publication (if any).
const RESEARCH_PAPER_TEXT = `
TODO: Paste your research paper abstract or full text here.
`;

// TODO: Paste your cover letter or statement of purpose (if any).
const COVER_LETTER_TEXT = `
TODO: Paste your cover letter text here.
`;

async function seed() {
  console.log("Seeding Firestore...");

  // --- Profile ---
  await setDoc(
    doc(db, "users", USER_ID, "profile", "main"),
    {
      name: "TODO: Your Full Name",
      email: "TODO: your@email.com",
      tagline: "TODO: One-line professional tagline",
      githubUrl: "https://github.com/TODO",
      linkedinUrl: "https://linkedin.com/in/TODO",
      personalDescription: "TODO: 2–3 sentence bio shown to the LLM as context.",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✓ Profile seeded");

  // --- Current Resume ---
  await setDoc(
    doc(db, "users", USER_ID, "resumes", "current"),
    {
      type: "current",
      fileName: "TODO: YourName-Resume.pdf",
      textContent: RESUME_TEXT,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✓ Resume seeded");

  // --- Prompt Starters ---
  // These appear as clickable chips on the landing page.
  // Icons must be valid Lucide icon names (Code, Briefcase, Sparkles, GraduationCap, Lightbulb, MessageSquare).
  const prompts = [
    { text: "TODO: First prompt question", icon: "Code", order: 0 },
    { text: "TODO: Second prompt question", icon: "Briefcase", order: 1 },
    { text: "TODO: Third prompt question", icon: "Sparkles", order: 2 },
    { text: "TODO: Fourth prompt question", icon: "GraduationCap", order: 3 },
    { text: "TODO: Fifth prompt question", icon: "Lightbulb", order: 4 },
  ];
  for (let i = 0; i < prompts.length; i++) {
    await setDoc(
      doc(db, "users", USER_ID, "prompts", `prompt-${i}`),
      { ...prompts[i], createdAt: serverTimestamp() },
      { merge: true }
    );
  }
  console.log("✓ Prompts seeded");

  // --- Research Paper (optional — remove if not applicable) ---
  await setDoc(
    doc(db, "users", USER_ID, "documents", "research_paper"),
    {
      type: "research_paper",
      title: "TODO: Title of your research paper or publication",
      textContent: RESEARCH_PAPER_TEXT,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✓ Research paper seeded");

  // --- Cover Letter (optional — remove if not applicable) ---
  await setDoc(
    doc(db, "users", USER_ID, "documents", "cover_letter"),
    {
      type: "cover_letter",
      title: "TODO: Cover Letter / Statement of Purpose",
      textContent: COVER_LETTER_TEXT,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("✓ Cover letter seeded");

  console.log("\nDone! All data seeded to Firestore.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
