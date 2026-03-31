import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";

const DEFAULT_USER_ID = "kumar-vaibhav";

// --- Profile ---

export interface UserProfile {
  name: string;
  email: string;
  tagline: string;
  githubUrl: string;
  linkedinUrl: string;
  personalDescription: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function getProfile(userId = DEFAULT_USER_ID): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId, "profile", "main"));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setProfile(data: Partial<UserProfile>, userId = DEFAULT_USER_ID) {
  await setDoc(
    doc(db, "users", userId, "profile", "main"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// --- Resumes ---

export interface ResumeDoc {
  type: "current" | "master";
  fileName: string;
  textContent: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  uploadedAt?: unknown;
  updatedAt?: unknown;
}

export async function getResume(
  type: "current" | "master",
  userId = DEFAULT_USER_ID
): Promise<ResumeDoc | null> {
  const snap = await getDoc(doc(db, "users", userId, "resumes", type));
  return snap.exists() ? (snap.data() as ResumeDoc) : null;
}

export async function setResume(
  type: "current" | "master",
  data: Partial<ResumeDoc>,
  userId = DEFAULT_USER_ID
) {
  await setDoc(
    doc(db, "users", userId, "resumes", type),
    { ...data, type, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getAllResumes(userId = DEFAULT_USER_ID): Promise<ResumeDoc[]> {
  const snap = await getDocs(collection(db, "users", userId, "resumes"));
  return snap.docs.map((d) => d.data() as ResumeDoc);
}

// --- Custom Prompts ---

export interface CustomPrompt {
  id?: string;
  text: string;
  icon?: string;
  order: number;
  createdAt?: unknown;
}

export async function getCustomPrompts(userId = DEFAULT_USER_ID): Promise<CustomPrompt[]> {
  const q = query(
    collection(db, "users", userId, "prompts"),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CustomPrompt);
}

export async function setCustomPrompt(
  promptId: string,
  data: Partial<CustomPrompt>,
  userId = DEFAULT_USER_ID
) {
  await setDoc(
    doc(db, "users", userId, "prompts", promptId),
    { ...data, createdAt: serverTimestamp() },
    { merge: true }
  );
}

export async function deleteCustomPrompt(promptId: string, userId = DEFAULT_USER_ID) {
  await deleteDoc(doc(db, "users", userId, "prompts", promptId));
}

// --- Documents (Research Paper, Cover Letter / SOP) ---

export interface UserDocument {
  type: "research_paper" | "cover_letter";
  title: string;
  textContent: string;
  updatedAt?: unknown;
}

export async function getUserDocument(
  type: "research_paper" | "cover_letter",
  userId = DEFAULT_USER_ID
): Promise<UserDocument | null> {
  const snap = await getDoc(doc(db, "users", userId, "documents", type));
  return snap.exists() ? (snap.data() as UserDocument) : null;
}

export async function setUserDocument(
  type: "research_paper" | "cover_letter",
  data: Partial<UserDocument>,
  userId = DEFAULT_USER_ID
) {
  await setDoc(
    doc(db, "users", userId, "documents", type),
    { ...data, type, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// --- Assemble LLM Context ---

export async function assembleLLMContext(userId = DEFAULT_USER_ID): Promise<string> {
  const [profile, resumes, documents] = await Promise.all([
    getProfile(userId),
    getAllResumes(userId),
    Promise.all([
      getUserDocument("research_paper", userId),
      getUserDocument("cover_letter", userId),
    ]),
  ]);

  const parts: string[] = [];

  if (profile) {
    parts.push(`NAME: ${profile.name}`);
    parts.push(`EMAIL: ${profile.email}`);
    if (profile.linkedinUrl) parts.push(`LINKEDIN: ${profile.linkedinUrl}`);
    if (profile.githubUrl) parts.push(`GITHUB: ${profile.githubUrl}`);
    if (profile.tagline) parts.push(`TAGLINE: ${profile.tagline}`);
    if (profile.personalDescription) {
      parts.push(`\nPERSONAL DESCRIPTION:\n${profile.personalDescription}`);
    }
  }

  const currentResume = resumes.find((r) => r.type === "current");
  const masterResume = resumes.find((r) => r.type === "master");

  if (currentResume?.textContent) {
    parts.push(`\nCURRENT RESUME:\n${currentResume.textContent}`);
  }
  if (masterResume?.textContent) {
    parts.push(`\nMASTER RESUME (additional details):\n${masterResume.textContent}`);
  }

  const [researchPaper, coverLetter] = documents;
  if (researchPaper?.textContent) {
    parts.push(
      `\nRESEARCH PAPER — ${researchPaper.title || "Untitled"}:\n${researchPaper.textContent}`
    );
  }
  if (coverLetter?.textContent) {
    parts.push(
      `\nSTATEMENT OF PURPOSE / COVER LETTER — ${coverLetter.title || "Untitled"}:\n${coverLetter.textContent}`
    );
  }

  return parts.join("\n");
}
