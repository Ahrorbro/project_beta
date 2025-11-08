import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const paymentSchema = z.object({
  unitId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string(),
  paidDate: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
});

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

    const body = await request.json();
    const validated = paymentSchema.parse(body);

    // Verify unit belongs to landlord and get first tenant - optimized query
    const unitTenant = await prisma.unitTenant.findFirst({
      where: {
        unit: {
          id: validated.unitId,
          property: {
            landlordId: session.user.id,
          },
          isOccupied: true,
        },
      },
      select: {
        tenantId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!unitTenant) {
      return NextResponse.json(
        { error: "Unit not found or not occupied" },
        { status: 404 }
      );
    }

    const tenantId = unitTenant.tenantId;

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        unitId: validated.unitId,
        tenantId: tenantId,
        amount: validated.amount,
        dueDate: new Date(validated.dueDate),
        paidDate: validated.paidDate ? new Date(validated.paidDate) : null,
        status: validated.status,
      },
    });

    // Create audit log asynchronously (non-blocking)
    createAuditLog({
      userId: session.user.id,
      action: "CREATE_PAYMENT",
      entityType: "Payment",
      entityId: payment.id,
      details: {
        amount: validated.amount,
        status: validated.status,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    }).catch(() => {
      // Audit log failures shouldn't break the flow
    });

    return NextResponse.json(
      { message: "Payment recorded successfully", payment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

