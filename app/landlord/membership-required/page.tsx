"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { CreditCard, Lock, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface MembershipStatus {
  hasAccess: boolean;
  membershipPaid: boolean;
  membershipAmount: number;
  membershipPaymentDate: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialExpired: boolean;
  daysRemaining: number;
  isInTrial: boolean;
}

export default function MembershipRequiredPage() {
  const { data: session, status } = useSession();
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Fetch membership status
      fetch("/api/v1/landlords/membership-status")
        .then((res) => res.json())
        .then((data) => {
          setMembershipStatus(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user has access (trial or paid), redirect them
  if (membershipStatus?.hasAccess) {
    window.location.href = "/landlord/dashboard";
    return null;
  }

  const isTrialExpired = membershipStatus?.trialExpired || false;
  const daysRemaining = membershipStatus?.daysRemaining || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">
            {isTrialExpired ? "Trial Expired" : "Free Trial Active"}
          </h1>
          
          <div className="space-y-4 mb-6">
            {!isTrialExpired && daysRemaining > 0 ? (
              <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-white/80 text-sm mb-2">
                  Your free trial is active!
                </p>
                <p className="text-white font-bold text-lg">
                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                </p>
                <p className="text-white/60 text-xs mt-2">
                  After your trial expires, you'll need to pay the membership fee to continue using the platform.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <p className="text-white/80 text-sm mb-2">
                  {isTrialExpired 
                    ? "Your 14-day free trial has expired."
                    : "Your membership payment has not been recorded."}
                </p>
                <p className="text-white/80 text-sm">
                  Membership fee:{" "}
                  <span className="font-bold text-white">
                    ${membershipStatus?.membershipAmount?.toFixed(2) || "80.00"}
                  </span>
                </p>
              </div>
            )}
            
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-white/60" />
              <p className="text-white/60 text-sm">
                {isTrialExpired
                  ? "Please contact the Super Admin to process your membership payment. Once payment is recorded, you will have full access to your landlord panel."
                  : "Enjoy your free trial! Contact the Super Admin to set up your membership payment before the trial expires."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <GlassButton variant="orange" className="w-full">
                Back to Login
              </GlassButton>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

