import { NextRequest, NextResponse } from "next/server";
import { prismaQuery as prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Determine role based on email domain
    // Super Admin: ahrorbek@rentify.com
    // Landlords: @rentify.com (created by Super Admin)
    // Tenants: all other emails
    let role: "SUPER_ADMIN" | "TENANT" = "TENANT";

    if (validated.email === "ahrorbek@rentify.com") {
      role = "SUPER_ADMIN";
    } else if (validated.email.endsWith("@rentify.com")) {
      // Only allow landlords if they're created by Super Admin
      // For now, we'll treat @rentify.com emails as potential landlords
      // but they need to be created by Super Admin
      return NextResponse.json(
        { error: "Landlord accounts must be created by Super Admin. Please use a different email or contact support." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone,
        role,
        ...(role === "TENANT" ? { tenantProfileComplete: false } : {}),
      },
    });

    // Create subscription with 14-day free trial for everyone
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE_TRIAL",
        status: "ACTIVE",
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
      },
    });

    return NextResponse.json(
      { 
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
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

    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

