import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";
import { internalErrorResponse, unauthorizedResponse, badRequestResponse, successResponse } from "@/lib/api-response";

const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional().nullable(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "LANDLORD" && session.user.role !== "SUPER_ADMIN")) {
      return unauthorizedResponse("Unauthorized");
    }

    const paymentId = params.id;
    const body = await request.json();
    const validated = updatePaymentSchema.parse(body);

    // Get the payment with unit and property info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        unit: {
          include: {
            property: {
              select: {
                landlordId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return badRequestResponse("Payment not found");
    }

    // Verify authorization: Landlord can only edit their own payments, Super Admin can edit any
    if (
      session.user.role === "LANDLORD" &&
      payment.unit.property.landlordId !== session.user.id
    ) {
      return unauthorizedResponse("You can only edit payments for your own properties");
    }

    // Prepare update data
    const updateData: {
      amount?: number;
      dueDate?: Date;
      paidDate?: Date | null;
      status?: "PENDING" | "PAID" | "OVERDUE";
      editedAt?: Date;
    } = {};

    // Check if any field is being updated
    const hasChanges = 
      (validated.amount !== undefined && validated.amount !== payment.amount) ||
      (validated.dueDate !== undefined && validated.dueDate !== payment.dueDate.toISOString().split('T')[0]) ||
      (validated.paidDate !== undefined && validated.paidDate !== (payment.paidDate ? payment.paidDate.toISOString().split('T')[0] : null)) ||
      (validated.status !== undefined && validated.status !== payment.status);

    if (validated.amount !== undefined) {
      updateData.amount = validated.amount;
    }
    if (validated.dueDate !== undefined) {
      updateData.dueDate = new Date(validated.dueDate);
    }
    if (validated.paidDate !== undefined) {
      updateData.paidDate = validated.paidDate ? new Date(validated.paidDate) : null;
    }
    if (validated.status !== undefined) {
      updateData.status = validated.status;
    }

    // Set editedAt if there are any changes
    if (hasChanges) {
      updateData.editedAt = new Date();
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            rentAmount: true,
            property: {
              select: {
                address: true,
              },
            },
          },
        },
        tenant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_PAYMENT",
      entityType: "Payment",
      entityId: paymentId,
      details: {
        changes: updateData,
        previousStatus: payment.status,
        newStatus: updateData.status || payment.status,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return successResponse(
      { message: "Payment updated successfully", payment: updatedPayment },
      200
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return internalErrorResponse(error, "Failed to update payment");
  }
}

