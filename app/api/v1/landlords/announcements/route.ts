import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetType: z.enum(["ALL_TENANTS", "SPECIFIC_TENANTS", "PROPERTY_TENANTS"]),
  propertyId: z.string().optional(),
  tenantIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createAnnouncementSchema.parse(body);

    // Verify property and determine recipients based on targetType
    let recipientTenantIds: string[] = [];

    if (validated.targetType === "PROPERTY_TENANTS") {
      if (!validated.propertyId) {
        return NextResponse.json(
          { error: "Property ID is required for property tenants announcement" },
          { status: 400 }
        );
      }
      
      // Verify property belongs to landlord
      const property = await prisma.property.findFirst({
        where: {
          id: validated.propertyId,
          landlordId: session.user.id,
        },
        select: { id: true },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }
      
      // Direct query to get tenant IDs - much faster than nested includes
      const unitTenants = await prisma.unitTenant.findMany({
        where: {
          unit: {
            propertyId: validated.propertyId,
          },
        },
        select: {
          tenantId: true,
        },
      });
      
      // Use Set to deduplicate tenant IDs
      recipientTenantIds = Array.from(new Set(unitTenants.map(ut => ut.tenantId)));
    } else if (validated.targetType === "ALL_TENANTS") {
      // Direct query to get all tenant IDs from landlord's properties - optimized
      const unitTenants = await prisma.unitTenant.findMany({
        where: {
          unit: {
            property: {
              landlordId: session.user.id,
            },
          },
        },
        select: {
          tenantId: true,
        },
      });
      
      // Use Set to deduplicate tenant IDs
      recipientTenantIds = Array.from(new Set(unitTenants.map(ut => ut.tenantId)));
    } else if (validated.targetType === "SPECIFIC_TENANTS") {
      // Use provided tenant IDs
      if (!validated.tenantIds || validated.tenantIds.length === 0) {
        return NextResponse.json(
          { error: "At least one tenant must be selected for specific tenants announcement" },
          { status: 400 }
        );
      }
      recipientTenantIds = validated.tenantIds;
    }

    // Create announcement first (recipients need announcement ID)
    const announcement = await prisma.announcement.create({
      data: {
        landlordId: session.user.id,
        propertyId: validated.propertyId || null,
        title: validated.title,
        message: validated.message,
        targetType: validated.targetType,
        tenantIds: validated.tenantIds || [],
      },
    });

    // Create recipient records (batch insert for performance)
    if (recipientTenantIds.length > 0) {
      await prisma.announcementRecipient.createMany({
        data: recipientTenantIds.map(tenantId => ({
          announcementId: announcement.id,
          tenantId,
        })),
        skipDuplicates: true,
      });
    }

    // Create audit log asynchronously (non-blocking - don't wait for it)
    createAuditLog({
      userId: session.user.id,
      action: "CREATE_ANNOUNCEMENT",
      entityType: "Announcement",
      entityId: announcement.id,
      details: {
        title: announcement.title,
        targetType: announcement.targetType,
        recipientsCount: recipientTenantIds.length,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    }).catch(() => {
      // Audit log failures shouldn't break the flow
    });

    return NextResponse.json(
      { 
        message: "Announcement created successfully",
        announcement,
        recipientsCount: recipientTenantIds.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const announcements = await prisma.announcement.findMany({
      where: { landlordId: session.user.id },
      include: {
        property: {
          select: {
            id: true,
            address: true,
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

