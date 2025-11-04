"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CreditCard, CheckCircle, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";

interface MembershipPaymentFormProps {
  landlordId: string;
  landlordName: string;
  currentStatus: {
    membershipPaid: boolean;
    membershipPaymentDate: Date | null;
    membershipAmount: number;
  };
}

export function MembershipPaymentForm({
  landlordId,
  landlordName,
  currentStatus,
}: MembershipPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [editAmount, setEditAmount] = useState(currentStatus.membershipAmount.toString());

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/landlords/${landlordId}/membership-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod,
          amount: currentStatus.membershipAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment failed");
      }

      toast.success("Membership payment recorded successfully!");
      // Reload the page to show updated payment status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePayment = async () => {
    if (!confirm("Are you sure you want to revoke this membership payment? The landlord will lose access to their panel.")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/landlords/${landlordId}/membership-payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipPaid: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke payment");
      }

      toast.success("Membership payment revoked successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/landlords/${landlordId}/membership-payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          membershipPaid: true,
          membershipAmount: parseFloat(editAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update payment");
      }

      toast.success("Membership payment updated successfully!");
      setIsEditing(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-white/80" />
        <h3 className="text-xl font-semibold text-white">Membership Payment</h3>
      </div>

      {currentStatus.membershipPaid ? (
        <div className="space-y-4">
          {!isEditing ? (
            <>
              <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-100">Payment Status: Paid</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/60 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {currentStatus.membershipPaymentDate && (
                  <p className="text-sm text-white/80">
                    Paid on: {new Date(currentStatus.membershipPaymentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Amount</p>
                <p className="text-2xl font-bold text-white">${currentStatus.membershipAmount.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <GlassButton
                  variant="orange"
                  onClick={handleRevokePayment}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Revoking...
                    </span>
                  ) : (
                    "Revoke Payment"
                  )}
                </GlassButton>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Edit Payment</h4>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditAmount(currentStatus.membershipAmount.toString());
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <GlassInput
                label="Membership Amount (USD)"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="flex gap-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditAmount(currentStatus.membershipAmount.toString());
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="green"
                  onClick={handleUpdatePayment}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Updating...
                    </span>
                  ) : (
                    "Update Amount"
                  )}
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <p className="font-semibold text-orange-100 mb-2">Payment Required</p>
            <p className="text-sm text-white/80">
              This landlord's membership payment of ${currentStatus.membershipAmount.toFixed(2)} has not been paid.
              They will not have access to their panel until payment is recorded.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="glass-input w-full"
            >
              <option value="manual">Manual Payment</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/60 mb-1">Amount to Record</p>
            <p className="text-2xl font-bold text-white">${currentStatus.membershipAmount.toFixed(2)}</p>
          </div>

          <GlassButton
            variant="green"
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Recording Payment...
              </span>
            ) : (
              "Record Payment"
            )}
          </GlassButton>
        </div>
      )}
    </GlassCard>
  );
}

