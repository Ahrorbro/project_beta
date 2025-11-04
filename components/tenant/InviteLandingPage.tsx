"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Building2, User, Mail, Lock, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { signIn } from "next-auth/react";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
  acceptedTerms: z.boolean().refine((val) => val === true),
  acceptedPDPA: z.boolean().refine((val) => val === true),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

interface InviteLandingPageProps {
  unit: {
    id: string;
    unitNumber: string;
    isOccupied: boolean;
    property: {
      address: string;
    };
    tenants?: Array<{
      tenant: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
  };
  token: string;
}

export function InviteLandingPage({ unit, token }: InviteLandingPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    acceptedTerms: false,
    acceptedPDPA: false,
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = signUpSchema.parse(signUpData);

      const response = await fetch("/api/v1/tenants/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          invitationToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      // Auto login after signup
      const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Account created successfully!");
        router.push("/tenant/dashboard");
      } else {
        toast.error("Account created but failed to log in. Please try logging in.");
        setMode("login");
        setLoginData({ email: validated.email, password: "" });
      }
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
        toast.error(error instanceof Error ? error.message : "Failed to sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validated = loginSchema.parse(loginData);

      const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
      } else if (result?.ok) {
        // Link tenant to unit if not already linked
        const linkResponse = await fetch("/api/v1/tenants/link-unit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitationToken: token }),
        });

        if (linkResponse.ok) {
          toast.success("Logged in successfully!");
          router.push("/tenant/dashboard");
        } else {
          toast.success("Logged in successfully!");
          router.push("/tenant/dashboard");
        }
      }
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
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if unit is occupied (has at least one tenant)
  const isOccupied = unit?.isOccupied && unit?.tenants && unit.tenants.length > 0;
  const currentTenants = unit?.tenants || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md">
        <GlassCard>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Welcome to Rentify
            </h1>
            {unit?.property?.address && (
              <p className="text-white/60 mb-2">{unit.property.address}</p>
            )}
            {unit?.unitNumber && (
              <p className="text-sm text-white/60">Unit {unit.unitNumber}</p>
            )}
          </div>

          {/* Show message if unit has tenants */}
          {isOccupied && (
            <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <p className="text-sm font-semibold text-blue-100 mb-2">
                Unit Has {currentTenants.length} Tenant{currentTenants.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-white/80 mb-2">
                This unit already has tenant(s). You can still join this unit (e.g., spouse, roommate, family member).
              </p>
              {currentTenants.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-white/60 font-medium">Current tenant(s):</p>
                  {currentTenants.map((ut, idx) => (
                    <p key={ut.tenant.id} className="text-xs text-white/80">
                      {idx + 1}. {ut.tenant.name || ut.tenant.email}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === "signup" ? (
            <form onSubmit={handleSignUp} className="space-y-6">
              {isOccupied && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300">
                    ℹ️ This unit already has {currentTenants.length} tenant{currentTenants.length > 1 ? "s" : ""}. You can join them in this unit!
                  </p>
                </div>
              )}
              <GlassInput
                label="Full Name"
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                error={errors.name}
                disabled={isLoading}
                required
                icon={<User className="w-4 h-4" />}
              />

              <GlassInput
                label="Email"
                type="email"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                error={errors.email}
                disabled={isLoading}
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <GlassInput
                label="Phone Number"
                type="tel"
                value={signUpData.phone}
                onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                error={errors.phone}
                disabled={isLoading}
                required
                icon={<Phone className="w-4 h-4" />}
              />

              <GlassInput
                label="Password"
                type="password"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                error={errors.password}
                disabled={isLoading}
                required
                icon={<Lock className="w-4 h-4" />}
                showPasswordToggle
              />

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={signUpData.acceptedTerms}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, acceptedTerms: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
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

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={signUpData.acceptedPDPA}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, acceptedPDPA: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">PDPA Compliance</p>
                    <p className="text-xs text-white/60">
                      I acknowledge compliance with the Tanzanian Personal Data Protection Act
                    </p>
                  </div>
                </label>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Creating Account...
                  </span>
                ) : (
                  "Create Account & Join Unit"
                )}
              </GlassButton>

              <p className="text-center text-sm text-white/60">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Log in
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <GlassInput
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                error={errors.email}
                disabled={isLoading}
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <GlassInput
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                error={errors.password}
                disabled={isLoading}
                required
                icon={<Lock className="w-4 h-4" />}
                showPasswordToggle
              />

              <GlassButton
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </GlassButton>

              <p className="text-center text-sm text-white/60">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

