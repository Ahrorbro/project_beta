"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { z } from "zod";
import type { User } from "@prisma/client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

interface LandlordOnboardingFormProps {
  landlord: User | null;
}

export function LandlordOnboardingForm({ landlord }: LandlordOnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: landlord?.name || "",
    phone: landlord?.phone || "",
    acceptedTerms: false,
    acceptedPDPA: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = profileSchema.parse({
        name: formData.name,
        phone: formData.phone,
      });

      const response = await fetch("/api/v1/landlords/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    }
  };

  const handleTermsSubmit = async () => {
    if (!formData.acceptedTerms || !formData.acceptedPDPA) {
      toast.error("Please accept both Terms & Conditions and PDPA compliance");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/landlords/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptedTerms: formData.acceptedTerms,
          acceptedPDPA: formData.acceptedPDPA,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to complete onboarding");
      }

      toast.success("Onboarding completed!");
      // Force a hard redirect to ensure the page reloads
      window.location.href = "/landlord/dashboard";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Welcome to Rentify
        </h1>
        <p className="text-white/60">Let's set up your profile</p>
      </div>

      {step === 1 && (
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6 text-white">Profile Setup</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <GlassInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <GlassInput
              label="Phone Number (Optional)"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />

            <GlassButton type="submit" variant="primary" className="w-full">
              Continue
            </GlassButton>
          </form>
        </GlassCard>
      )}

      {step === 2 && (
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6 text-white">Terms & Compliance</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-white">
                    I accept the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </label>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptedPDPA}
                  onChange={(e) => setFormData({ ...formData, acceptedPDPA: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-white">PDPA Compliance</p>
                  <p className="text-sm text-white/60">
                    I acknowledge compliance with the Tanzanian Personal Data Protection Act
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-4">
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                onClick={handleTermsSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Completing...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

