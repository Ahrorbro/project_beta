"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { DollarSign, Calendar, Edit2, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EditPaymentForm } from "./EditPaymentForm";

import { PaymentStatus } from "@prisma/client";

interface Payment {
  id: string;
  amount: number;
  dueDate: Date | string;
  paidDate: Date | string | null;
  status: PaymentStatus;
  editedAt?: Date | string | null;
  unit: {
    unitNumber: string;
    rentAmount?: number;
    property: {
      address: string;
    };
  };
  tenant: {
    name: string | null;
    email: string;
  };
}

interface PaymentItemProps {
  payment: Payment;
}

export function PaymentItem({ payment }: PaymentItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSuccess = () => {
    setIsEditing(false);
    window.location.reload();
  };

  if (isEditing) {
    return (
      <EditPaymentForm
        payment={payment}
        onSuccess={handleEditSuccess}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-white/60" />
            <p className="text-xl font-bold text-white">{formatCurrency(payment.amount)}</p>
            {payment.editedAt && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Edited
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/60">
            <div>
              <p className="text-xs text-white/40">Tenant</p>
              <p className="text-white">{payment.tenant.name || payment.tenant.email}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Property</p>
              <p className="text-white">{payment.unit.property.address}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Unit</p>
              <p className="text-white">Unit {payment.unit.unitNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {formatDate(payment.dueDate)}</span>
            </div>
          </div>
          {payment.paidDate && (
            <div className="mt-2 text-sm text-white/60">
              Paid: {formatDate(payment.paidDate)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              payment.status === "PAID"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : payment.status === "OVERDUE"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : payment.status === "FAILED"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
            }`}
          >
            {payment.status}
          </span>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

