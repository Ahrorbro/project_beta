import { NextRequest, NextResponse } from "next/server";
import { prismaQuery as prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1),
  acceptedTerms: z.boolean().refine((val) => val === true),
  acceptedPDPA: z.boolean().refine((val) => val === true),
  invitationToken: z.string(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signUpSchema.parse(body);

    // Verify invitation token
    const unit = await prisma.unit.findUnique({
      where: { invitationToken: validated.invitationToken },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Invalid invitation link" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists. Please log in instead." },
        { status: 400 }
      );
    }

    // Check if tenant is already linked to this unit
    const existingLink = await prisma.unitTenant.findFirst({
      where: {
        unitId: unit.id,
        tenant: {
          email: validated.email,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "You are already linked to this unit. Please log in instead." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create tenant and link to unit in a transaction
    const { randomBytes } = await import("crypto");
    const newInvitationToken = randomBytes(32).toString("hex");
    
    const tenant = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone,
        role: "TENANT",
        tenantProfileComplete: true,
        tenantUnits: {
          create: {
            unitId: unit.id,
          },
        },
      },
    });

    // Mark unit as occupied and regenerate invitation token
    await prisma.unit.update({
      where: { id: unit.id },
      data: {
        isOccupied: true,
        invitationToken: newInvitationToken, // Regenerate token for next person
      },
    });

    // Create subscription with 14-day free trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    await prisma.subscription.create({
      data: {
        userId: tenant.id,
        plan: "FREE_TRIAL",
        status: "ACTIVE",
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", tenant },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

