import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { internalErrorResponse, unauthorizedResponse, badRequestResponse, successResponse } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

const paymentSchema = z.object({
  paymentMethod: z.string().min(1),
  amount: z.number().positive(),
});

const updateMembershipSchema = z.object({
  membershipPaid: z.boolean(),
  membershipAmount: z.number().positive().optional(),
  membershipPaymentDate: z.string().nullable().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = paymentSchema.parse(body);

    // Verify landlord exists
    const landlord = await prisma.user.findUnique({
      where: { id: params.id, role: "LANDLORD" },
      include: { subscription: true },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Landlord not found" },
        { status: 404 }
      );
    }

    // Update subscription with payment
    if (landlord.subscription) {
      await prisma.subscription.update({
        where: { id: landlord.subscription.id },
        data: {
          membershipPaid: true,
          membershipPaymentDate: new Date(),
          membershipAmount: validated.amount,
          status: "ACTIVE",
        },
      });
    } else {
      // Create subscription if it doesn't exist
      await prisma.subscription.create({
        data: {
          userId: landlord.id,
          plan: "BASIC",
          status: "ACTIVE",
          membershipPaid: true,
          membershipPaymentDate: new Date(),
          membershipAmount: validated.amount,
        },
      });
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "RECORD_MEMBERSHIP_PAYMENT",
      entityType: "Subscription",
      entityId: landlord.subscription?.id || "",
      details: {
        landlordId: params.id,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse(
      {
        message: "Membership payment recorded successfully",
        membershipPaid: true,
        membershipPaymentDate: new Date(),
      },
      200
    );
  } catch (error) {
    console.error("Error recording membership payment:", error);
    return internalErrorResponse(error, "Failed to record membership payment");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return unauthorizedResponse("Unauthorized");
    }

    const body = await request.json();
    const validated = updateMembershipSchema.parse(body);

    // Verify landlord exists
    const landlord = await prisma.user.findUnique({
      where: { id: params.id, role: "LANDLORD" },
      include: { subscription: true },
    });

    if (!landlord) {
      return badRequestResponse("Landlord not found");
    }

    if (!landlord.subscription) {
      return badRequestResponse("Landlord does not have a subscription record");
    }

    // Prepare update data
    const updateData: {
      membershipPaid: boolean;
      membershipPaymentDate?: Date | null;
      membershipAmount?: number;
      status?: "ACTIVE" | "INACTIVE" | "CANCELLED";
    } = {
      membershipPaid: validated.membershipPaid,
    };

    if (validated.membershipPaymentDate !== undefined) {
      updateData.membershipPaymentDate = validated.membershipPaymentDate
        ? new Date(validated.membershipPaymentDate)
        : null;
    }

    if (validated.membershipAmount !== undefined) {
      updateData.membershipAmount = validated.membershipAmount;
    }

    // Update status based on payment status
    if (validated.membershipPaid) {
      updateData.status = "ACTIVE";
      if (!updateData.membershipPaymentDate) {
        updateData.membershipPaymentDate = new Date();
      }
    } else {
      updateData.status = "INACTIVE";
      updateData.membershipPaymentDate = null;
    }

    // Update subscription
    await prisma.subscription.update({
      where: { id: landlord.subscription.id },
      data: updateData,
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_MEMBERSHIP_PAYMENT",
      entityType: "Subscription",
      entityId: landlord.subscription.id,
      details: {
        landlordId: params.id,
        changes: updateData,
        previousStatus: landlord.subscription.membershipPaid,
        newStatus: validated.membershipPaid,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse(
      {
        message: "Membership payment status updated successfully",
        membershipPaid: validated.membershipPaid,
      },
      200
    );
  } catch (error) {
    console.error("Error updating membership payment:", error);
    return internalErrorResponse(error, "Failed to update membership payment");
  }
}

