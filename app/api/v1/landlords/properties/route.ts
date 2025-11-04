import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const propertySchema = z.object({
  address: z.string().min(1),
  propertyType: z.enum(["single", "multi"]),
  description: z.string().optional(),
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
    const validated = propertySchema.parse(body);

    // Check subscription limits for Basic plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.plan === "BASIC") {
      const propertyCount = await prisma.property.count({
        where: { landlordId: session.user.id },
      });

      if (propertyCount >= 5) {
        return NextResponse.json(
          { error: "Basic plan limit reached. Upgrade to Pro for unlimited properties." },
          { status: 403 }
        );
      }
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        address: validated.address,
        propertyType: validated.propertyType,
        description: validated.description,
        landlordId: session.user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_PROPERTY",
      entityType: "Property",
      entityId: property.id,
      details: { address: property.address, propertyType: property.propertyType },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating property:", error);
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

    const properties = await prisma.property.findMany({
      where: { landlordId: session.user.id },
      include: {
        units: true,
        _count: {
          select: {
            units: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

