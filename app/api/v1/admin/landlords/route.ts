import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const landlordSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().refine((email) => email.endsWith("@rentify.com")),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = landlordSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create landlord
    const landlord = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone,
        role: "LANDLORD",
        createdAtBy: session.user.id,
        landlordProfileComplete: false,
      },
    });

    // Create subscription with free trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    await prisma.subscription.create({
      data: {
        userId: landlord.id,
        plan: "FREE_TRIAL",
        status: "ACTIVE",
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE_LANDLORD",
      entityType: "User",
      entityId: landlord.id,
      details: { email: landlord.email, name: landlord.name },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Landlord created successfully", landlord },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating landlord:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const landlords = await prisma.user.findMany({
      where: { role: "LANDLORD" },
      include: {
        subscription: true,
        _count: {
          select: {
            landlordProperties: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ landlords });
  } catch (error) {
    console.error("Error fetching landlords:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

