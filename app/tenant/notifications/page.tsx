"use client";

import { useEffect, useState } from "react";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Bell, CreditCard, Wrench, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: "ANNOUNCEMENT" | "PAYMENT_REMINDER" | "PAYMENT_OVERDUE" | "MAINTENANCE_UPDATE";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  landlord?: { name: string | null; email: string };
  property?: { address: string };
  announcementId?: string;
  paymentId?: string;
  dueDate?: string;
  amount?: number;
  maintenanceRequestId?: string;
  status?: string;
}

export default function TenantNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/v1/tenants/notifications");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (announcementId: string) => {
    try {
      const response = await fetch("/api/v1/tenants/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.announcementId === announcementId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <Bell className="w-5 h-5 text-blue-400" />;
      case "PAYMENT_REMINDER":
        return <CreditCard className="w-5 h-5 text-yellow-400" />;
      case "PAYMENT_OVERDUE":
        return <CreditCard className="w-5 h-5 text-red-400" />;
      case "MAINTENANCE_UPDATE":
        return <Wrench className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-white/60" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return "border-l-blue-500";
      case "PAYMENT_REMINDER":
        return "border-l-yellow-500";
      case "PAYMENT_OVERDUE":
        return "border-l-red-500";
      case "MAINTENANCE_UPDATE":
        return "border-l-green-500";
      default:
        return "border-l-white/20";
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === "ANNOUNCEMENT" && notification.announcementId) {
      return null; // Announcements don't need links
    }
    if (notification.type === "PAYMENT_REMINDER" || notification.type === "PAYMENT_OVERDUE") {
      return "/tenant/payments";
    }
    if (notification.type === "MAINTENANCE_UPDATE" && notification.maintenanceRequestId) {
      return `/tenant/maintenance/${notification.maintenanceRequestId}`;
    }
    return null;
  };

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">Notifications</h1>
            <p className="text-white/60">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-lg font-semibold mb-2 text-white">No Notifications</h3>
            <p className="text-white/60">You're all caught up! No new notifications.</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <GlassCard
                  className={`border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.isRead ? "bg-blue-500/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-white/80 mb-3 whitespace-pre-wrap">{notification.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                        {notification.property && (
                          <span>📍 {notification.property.address}</span>
                        )}
                        {notification.landlord && (
                          <span>From: {notification.landlord.name || notification.landlord.email}</span>
                        )}
                        {notification.amount && (
                          <span className="font-semibold text-white">
                            Amount: {formatCurrency(notification.amount)}
                          </span>
                        )}
                        {notification.dueDate && (
                          <span>Due: {formatDate(new Date(notification.dueDate))}</span>
                        )}
                        <span>{formatDate(new Date(notification.createdAt))}</span>
                      </div>
                      {notification.type === "ANNOUNCEMENT" && !notification.isRead && (
                        <button
                          onClick={() => notification.announcementId && markAsRead(notification.announcementId)}
                          className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );

              return link ? (
                <Link key={notification.id} href={link}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}

