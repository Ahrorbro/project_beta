import { NextRequest, NextResponse } from "next/server";
import { runDailyNotificationChecks } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// This endpoint can be called by a cron job service (e.g., Vercel Cron, GitHub Actions, etc.)
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    // For example, check for a secret token in headers
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const results = await runDailyNotificationChecks();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error running notification checks:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

