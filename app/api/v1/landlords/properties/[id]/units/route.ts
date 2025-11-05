import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";
import { randomBytes } from "crypto";

const unitSchema = z.object({
  unitNumber: z.string().min(1),
  floor: z.number().int().positive().optional(),
  rentAmount: z.number().positive(),
  leaseStartDate: z.string().optional(),
  leaseEndDate: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify property belongs to landlord
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        landlordId: session.user.id,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = unitSchema.parse(body);

    // Generate unique invitation token
    const invitationToken = randomBytes(32).toString("hex");

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId: property.id,
        unitNumber: validated.unitNumber,
        floor: validated.floor,
        rentAmount: validated.rentAmount,
        leaseStartDate: validated.leaseStartDate ? new Date(validated.leaseStartDate) : null,
        leaseEndDate: validated.leaseEndDate ? new Date(validated.leaseEndDate) : null,
        invitationToken,
        isOccupied: false,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_UNIT",
      entityType: "Unit",
      entityId: unit.id,
      details: {
        unitNumber: unit.unitNumber,
        propertyId: property.id,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Unit created successfully", unit },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify property belongs to landlord
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        landlordId: session.user.id,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const units = await prisma.unit.findMany({
      where: { propertyId: property.id },
      include: {
        tenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: [
        { floor: "asc" },
        { unitNumber: "asc" },
      ],
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

