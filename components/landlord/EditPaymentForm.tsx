"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DollarSign, Calendar, Edit2, X, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency, formatDateInput } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";

interface Payment {
  id: string;
  amount: number;
  dueDate: Date | string;
  paidDate: Date | string | null;
  status: PaymentStatus;
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

interface EditPaymentFormProps {
  payment: Payment;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPaymentForm({ payment, onSuccess, onCancel }: EditPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    dueDate: formatDateInput(payment.dueDate),
    paidDate: payment.paidDate ? formatDateInput(payment.paidDate) : "",
    status: payment.status,
    isSixMonths: false,
    monthlyRent: payment.unit.rentAmount?.toString() || "",
  });

  // Calculate 6 months payment with 15% discount
  const calculateSixMonthsPayment = useCallback(() => {
    const monthlyRent = parseFloat(formData.monthlyRent) || 0;
    if (monthlyRent === 0) return { original: 0, discounted: 0, savings: 0 };
    const sixMonthsOriginal = monthlyRent * 6;
    const discount = sixMonthsOriginal * 0.15; // 15% discount
    const sixMonthsDiscounted = sixMonthsOriginal - discount;
    return {
      original: sixMonthsOriginal,
      discounted: sixMonthsDiscounted,
      savings: discount,
    };
  }, [formData.monthlyRent]);

  // Update amount when 6 months checkbox is checked
  useEffect(() => {
    if (formData.isSixMonths && formData.monthlyRent) {
      const calculation = calculateSixMonthsPayment();
      if (calculation.discounted > 0) {
        setFormData((prev) => ({
          ...prev,
          amount: calculation.discounted.toFixed(2),
        }));
      }
    } else if (!formData.isSixMonths && formData.monthlyRent) {
      setFormData((prev) => ({
        ...prev,
        amount: formData.monthlyRent,
      }));
    }
  }, [formData.isSixMonths, formData.monthlyRent, calculateSixMonthsPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/payments/${payment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          paidDate: formData.paidDate || null,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update payment");
      }

      toast.success("Payment updated successfully!");
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Edit2 className="w-5 h-5 text-white/80" />
          <h3 className="text-xl font-semibold text-white">Edit Payment</h3>
        </div>
        <button
          onClick={onCancel}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-white/60 mb-2">Tenant</p>
          <p className="text-white font-medium">
            {payment.tenant.name || payment.tenant.email}
          </p>
          <p className="text-sm text-white/60 mt-1">
            {payment.unit.property.address} • Unit {payment.unit.unitNumber}
          </p>
        </div>

        {/* Monthly Rent Input */}
        <GlassInput
          label="Monthly Rent (USD) - Required for 6 months calculation"
          type="number"
          step="0.01"
          value={formData.monthlyRent}
          onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
          disabled={isLoading}
          placeholder={payment.unit.rentAmount ? payment.unit.rentAmount.toString() : "Enter monthly rent"}
          icon={<DollarSign className="w-4 h-4" />}
        />

        {/* 6 Months Checkbox */}
        {formData.monthlyRent && parseFloat(formData.monthlyRent) > 0 && (
          <div className="w-full">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
              <input
                type="checkbox"
                checked={formData.isSixMonths}
                onChange={(e) => setFormData({ ...formData, isSixMonths: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  <p className="font-semibold text-white">6 Months Advance Payment</p>
                  <span className="text-xs text-emerald-300 font-medium">(15% Bonus)</span>
                </div>
                <p className="text-xs text-white/60">
                  Calculate 6 months payment with 15% discount
                </p>
              </div>
            </label>
          </div>
        )}

        {/* 6 Months Payment Details */}
        {formData.isSixMonths && formData.monthlyRent && parseFloat(formData.monthlyRent) > 0 && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-emerald-400" />
              <p className="font-semibold text-emerald-100">6 Months Advance Payment</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">6 months × {formatCurrency(parseFloat(formData.monthlyRent))}:</span>
                <span className="text-white">{formatCurrency(calculateSixMonthsPayment().original)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">15% Discount:</span>
                <span className="text-emerald-300">-{formatCurrency(calculateSixMonthsPayment().savings)}</span>
              </div>
              <div className="border-t border-emerald-500/30 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-white">Total to Pay:</span>
                <span className="font-bold text-emerald-300 text-lg">
                  {formatCurrency(calculateSixMonthsPayment().discounted)}
                </span>
              </div>
            </div>
          </div>
        )}

        {!formData.monthlyRent || parseFloat(formData.monthlyRent) === 0 ? (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-300">
              ⚠️ Please enter monthly rent to calculate 6 months payment with discount
            </p>
          </div>
        ) : null}

        <GlassInput
          label="Amount (USD)"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={isLoading || formData.isSixMonths}
          required
          icon={<DollarSign className="w-4 h-4" />}
        />

        {formData.amount && (
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-sm text-white/60">Amount to Record:</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(parseFloat(formData.amount) || 0)}
            </p>
          </div>
        )}

        <GlassInput
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          disabled={isLoading}
          required
          showCalendarIcon
        />

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Payment Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as PaymentStatus,
              })
            }
            className="glass-input w-full"
            disabled={isLoading}
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {formData.status === "PAID" && (
          <GlassInput
            label="Paid Date"
            type="date"
            value={formData.paidDate}
            onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
            disabled={isLoading}
            showCalendarIcon
          />
        )}

        {formData.status !== "PAID" && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/60">
              Paid date will be cleared when status is not "Paid"
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Updating...
              </span>
            ) : (
              "Update Payment"
            )}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}

