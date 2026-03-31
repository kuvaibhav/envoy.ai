import { NextResponse } from "next/server";
import { getCustomPrompts } from "@/lib/firebase/firestore";

export async function GET() {
  try {
    const prompts = await getCustomPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Fetch prompts error:", error);
    return NextResponse.json(
      { prompts: [], error: String(error) },
      { status: 500 }
    );
  }
}
