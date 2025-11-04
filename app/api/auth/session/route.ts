import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    return NextResponse.json(session || null);
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(null);
  }
}

