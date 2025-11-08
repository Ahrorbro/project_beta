import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for Buffer support

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if request is JSON (documentUrl) or FormData (file)
    const contentType = request.headers.get("content-type") || "";
    let documentUrl: string;
    let unitId: string;
    let tenantId: string;

    if (contentType.includes("application/json")) {
      // Client already uploaded to Cloudinary, just need to create lease
      const body = await request.json();
      documentUrl = body.documentUrl;
      unitId = body.unitId;
      tenantId = body.tenantId;
    } else {
      // Legacy: Upload file directly (for backward compatibility)
      const formData = await request.formData();
      const file = formData.get("file") as File;
      unitId = formData.get("unitId") as string;
      tenantId = formData.get("tenantId") as string;

      if (!file || !unitId || !tenantId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      documentUrl = await uploadToCloudinary(buffer, "leases");
    }

    if (!documentUrl || !unitId || !tenantId) {
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

