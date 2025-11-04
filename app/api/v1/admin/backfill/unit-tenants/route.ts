import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Build unit-tenant pairs from existing payments (most reliable historical source)
  const payments = await prisma.payment.findMany({
    select: { unitId: true, tenantId: true },
  });

  const uniquePairs = new Set<string>();
  const pairs: Array<{ unitId: string; tenantId: string }> = [];
  for (const p of payments) {
    const key = `${p.unitId}:${p.tenantId}`;
    if (!uniquePairs.has(key)) {
      uniquePairs.add(key);
      pairs.push({ unitId: p.unitId, tenantId: p.tenantId });
    }
  }

  let created = 0;
  for (const pair of pairs) {
    // Check existing link
    const existing = await prisma.unitTenant.findFirst({
      where: { unitId: pair.unitId, tenantId: pair.tenantId },
    });
    if (existing) continue;

    await prisma.unitTenant.create({ data: pair });
    // Mark unit occupied just in case
    await prisma.unit.update({ where: { id: pair.unitId }, data: { isOccupied: true } });
    created++;
  }

  return NextResponse.json({ message: "Backfill complete", created, totalPairs: pairs.length });
}
