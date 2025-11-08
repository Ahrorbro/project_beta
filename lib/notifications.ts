import { prismaQuery as prisma } from "@/lib/prisma";

/**
 * Check for payments due in 3 days and create reminder notifications
 * This should be called daily via a cron job or scheduled task
 */
export async function checkAndCreatePaymentReminders() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const now = new Date();

    // Find all pending payments due in 3 days - optimized with select
    const upcomingPayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        tenantId: true,
        amount: true,
        dueDate: true,
        unit: {
          select: {
            property: {
              select: {
                address: true,
              },
            },
          },
        },
      },
    });

    // Note: Payment reminders are generated dynamically in the notifications API
    // This function can be extended to send emails or push notifications
    // For now, reminders are shown in the notifications page

    return {
      success: true,
      remindersFound: upcomingPayments.length,
      payments: upcomingPayments.map(p => ({
        id: p.id,
        tenantId: p.tenantId,
        amount: p.amount,
        dueDate: p.dueDate,
        propertyAddress: p.unit.property.address,
      })),
    };
  } catch (error) {
    console.error("Error checking payment reminders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mark overdue payments
 */
export async function markOverduePayments() {
  try {
    const now = new Date();

    const result = await prisma.payment.updateMany({
      where: {
        status: "PENDING",
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: "OVERDUE",
      },
    });

    // Payments marked as overdue successfully

    return {
      success: true,
      overdueCount: result.count,
    };
  } catch (error) {
    console.error("Error marking overdue payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run all notification checks (to be called daily)
 */
export async function runDailyNotificationChecks() {
  const results = {
    paymentReminders: await checkAndCreatePaymentReminders(),
    overduePayments: await markOverduePayments(),
  };

  return results;
}

