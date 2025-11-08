import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parallelize all queries for better performance
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [announcements, upcomingPayments, overduePayments, maintenanceUpdates] = await Promise.all([
      // Get announcements
      prisma.announcementRecipient.findMany({
        where: {
          tenantId: session.user.id,
        },
        select: {
          id: true,
          isRead: true,
          readAt: true,
          createdAt: true,
          announcement: {
            select: {
              id: true,
              title: true,
              message: true,
              createdAt: true,
              landlord: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              property: {
                select: {
                  id: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Get upcoming payments - optimized with select
      prisma.payment.findMany({
        where: {
          tenantId: session.user.id,
          status: "PENDING",
          dueDate: {
            gte: now,
            lte: threeDaysFromNow,
          },
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          createdAt: true,
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
        orderBy: { dueDate: "asc" },
      }),
      // Get overdue payments - optimized with select
      prisma.payment.findMany({
        where: {
          tenantId: session.user.id,
          status: "OVERDUE",
        },
        select: {
          id: true,
          amount: true,
          dueDate: true,
          createdAt: true,
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
        orderBy: { dueDate: "asc" },
      }),
      // Get maintenance updates - optimized with select
      prisma.maintenanceRequest.findMany({
        where: {
          tenantId: session.user.id,
          status: { in: ["IN_PROGRESS", "RESOLVED"] },
          updatedAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
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
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    // Combine all notifications
    const notifications = [
      // Announcements
      ...announcements.map(ar => ({
        id: ar.id,
        type: "ANNOUNCEMENT" as const,
        title: ar.announcement.title,
        message: ar.announcement.message,
        isRead: ar.isRead,
        createdAt: ar.announcement.createdAt.toISOString(),
        readAt: ar.readAt?.toISOString() || null,
        landlord: ar.announcement.landlord,
        property: ar.announcement.property,
        announcementId: ar.announcement.id,
      })),
      // Payment reminders
      ...upcomingPayments.map(payment => ({
        id: `payment-reminder-${payment.id}`,
        type: "PAYMENT_REMINDER" as const,
        title: "Payment Due Soon",
        message: `Payment of ${payment.amount} is due on ${new Date(payment.dueDate).toLocaleDateString()}`,
        isRead: false,
        createdAt: payment.createdAt.toISOString(),
        readAt: null,
        property: { address: payment.unit.property.address },
        paymentId: payment.id,
        dueDate: payment.dueDate.toISOString(),
        amount: payment.amount,
      })),
      // Overdue payments
      ...overduePayments.map(payment => ({
        id: `payment-overdue-${payment.id}`,
        type: "PAYMENT_OVERDUE" as const,
        title: "Payment Overdue",
        message: `Payment of ${payment.amount} was due on ${new Date(payment.dueDate).toLocaleDateString()}`,
        isRead: false,
        createdAt: payment.createdAt.toISOString(),
        readAt: null,
        property: { address: payment.unit.property.address },
        paymentId: payment.id,
        dueDate: payment.dueDate.toISOString(),
        amount: payment.amount,
      })),
      // Maintenance updates
      ...maintenanceUpdates.map(request => ({
        id: `maintenance-${request.id}`,
        type: "MAINTENANCE_UPDATE" as const,
        title: `Maintenance Request: ${request.title}`,
        message: `Status updated to ${request.status}`,
        isRead: false,
        createdAt: request.updatedAt.toISOString(),
        readAt: null,
        property: { address: request.unit.property.address },
        maintenanceRequestId: request.id,
        status: request.status,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    // Mark announcement as read
    await prisma.announcementRecipient.updateMany({
      where: {
        announcementId,
        tenantId: session.user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Notification marked as read" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

