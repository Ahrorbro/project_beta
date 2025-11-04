import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const unitId = formData.get("unitId") as string;
    const tenantId = formData.get("tenantId") as string;

    if (!file || !unitId || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify unit belongs to landlord
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          landlordId: session.user.id,
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads", "leases");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${randomBytes(16).toString("hex")}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const documentUrl = `/uploads/leases/${fileName}`;

    // Create lease agreement
    const lease = await prisma.leaseAgreement.create({
      data: {
        unitId,
        tenantId,
        documentUrl,
        startDate: new Date(), // Default dates, can be updated later
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPLOAD_LEASE",
      entityType: "LeaseAgreement",
      entityId: lease.id,
      details: { unitId, tenantId },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Lease uploaded successfully", lease },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading lease:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

