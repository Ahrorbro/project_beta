"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Gift, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";

const paymentSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  paidDate: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
});

interface RecordPaymentFormProps {
  units: Array<{
    id: string;
    unitNumber: string;
    rentAmount: number;
    property: {
      address: string;
    };
    tenants: Array<{
      id: string;
      tenant: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
  }>;
}

export function RecordPaymentForm({ units }: RecordPaymentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitId: "",
    amount: "",
    dueDate: "",
    paidDate: "",
    status: "PENDING" as "PENDING" | "PAID" | "OVERDUE",
    paymentType: "monthly" as "monthly" | "6months",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedUnit = units.find((u) => u.id === formData.unitId);

  // Calculate 6 months payment with 15% discount
  const calculateSixMonthsPayment = () => {
    if (!selectedUnit) return { original: 0, discounted: 0, savings: 0 };
    const monthlyRent = selectedUnit.rentAmount;
    const sixMonthsOriginal = monthlyRent * 6;
    const discount = sixMonthsOriginal * 0.15; // 15% discount
    const sixMonthsDiscounted = sixMonthsOriginal - discount;
    return {
      original: sixMonthsOriginal,
      discounted: sixMonthsDiscounted,
      savings: discount,
    };
  };

  // Update amount when payment type or unit changes
  useEffect(() => {
    if (formData.paymentType === "6months" && selectedUnit) {
      const calculation = calculateSixMonthsPayment();
      setFormData((prev) => ({
        ...prev,
        amount: calculation.discounted.toFixed(2),
      }));
    } else if (formData.paymentType === "monthly" && selectedUnit) {
      setFormData((prev) => ({
        ...prev,
        amount: selectedUnit.rentAmount.toFixed(2),
      }));
    } else if (!selectedUnit) {
      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
    }
  }, [formData.paymentType, formData.unitId, selectedUnit?.rentAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = paymentSchema.parse({
        unitId: formData.unitId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        paidDate: formData.paidDate || undefined,
        status: formData.status,
      });

      const response = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record payment");
      }

      toast.success("Payment recorded successfully!");
      router.push("/landlord/payments");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to record payment");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Unit <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.unitId}
            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
            className="glass-input w-full"
            required
          >
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.property.address} - Unit {unit.unitNumber}
                {unit.tenant && ` (${unit.tenant.name || unit.tenant.email})`}
              </option>
            ))}
          </select>
          {errors.unitId && (
            <p className="mt-1 text-sm text-red-400">{errors.unitId}</p>
          )}
        </div>

        {selectedUnit && selectedUnit.tenants && selectedUnit.tenants.length > 0 && (
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-sm text-white/60 mb-1">
              Tenant{selectedUnit.tenants.length > 1 ? "s" : ""}
            </p>
            {selectedUnit.tenants.map((ut) => (
              <p key={ut.id} className="text-white font-medium">
                {ut.tenant.name || ut.tenant.email}
              </p>
            ))}
            <p className="text-sm text-white/60 mt-1">
              Monthly Rent: {formatCurrency(selectedUnit.rentAmount)}
            </p>
          </div>
        )}

        {/* Payment Type Selection */}
        {selectedUnit && (
          <div className="w-full">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Payment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: "monthly" })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.paymentType === "monthly"
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                <Calendar className="w-5 h-5 mx-auto mb-2 text-white/80" />
                <p className="font-semibold text-white text-sm">Monthly</p>
                <p className="text-xs text-white/60 mt-1">
                  {formatCurrency(selectedUnit.rentAmount)}/month
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentType: "6months" })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.paymentType === "6months"
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                <Gift className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                <p className="font-semibold text-white text-sm">6 Months</p>
                <p className="text-xs text-emerald-300 mt-1">15% Bonus!</p>
              </button>
            </div>
          </div>
        )}

        {/* 6 Months Payment Details */}
        {formData.paymentType === "6months" && selectedUnit && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-emerald-400" />
              <p className="font-semibold text-emerald-100">6 Months Advance Payment</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">6 months × {formatCurrency(selectedUnit.rentAmount)}:</span>
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

        <GlassInput
          label="Amount (USD)"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          error={errors.amount}
          disabled={isLoading || formData.paymentType === "6months"}
          required
          placeholder="Enter payment amount"
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
          error={errors.dueDate}
          disabled={isLoading}
          required
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Payment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["PENDING", "PAID", "OVERDUE"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.status === status
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="font-semibold text-white text-sm">{status}</p>
              </button>
            ))}
          </div>
        </div>

        {formData.status === "PAID" && (
          <GlassInput
            label="Paid Date"
            type="date"
            value={formData.paidDate}
            onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
            error={errors.paidDate}
            disabled={isLoading}
          />
        )}

        <div className="flex gap-4">
          <GlassButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Recording...
              </span>
            ) : (
              "Record Payment"
            )}
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
}

