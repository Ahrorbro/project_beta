"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Sign up failed";
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use default message
          errorMessage = `Sign up failed: ${response.statusText}`;
        }
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      toast.success("Account created successfully!");
      
      // Automatically sign in the user
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        // Redirect based on role
        const userRole = data.user?.role || "TENANT";
        let redirectPath = "/tenant/dashboard";
        
        if (userRole === "SUPER_ADMIN") {
          redirectPath = "/admin/dashboard";
        } else if (userRole === "LANDLORD") {
          redirectPath = "/landlord/dashboard";
        } else if (userRole === "TENANT") {
          redirectPath = "/tenant/dashboard";
        }
        
        toast.success("Welcome! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
        setIsLoading(false);
      } else {
        // If auto-sign-in fails, redirect to login
        toast.error("Account created. Please sign in.");
        setIsLoading(false);
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Sign up error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md">
        <GlassCard>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">
              Rentify
            </h1>
            <p className="text-white/60">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter your full name"
              disabled={isLoading}
            />

            <GlassInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />

            <GlassInput
              label="Phone (Optional)"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />

            <GlassInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
              disabled={isLoading}
              showPasswordToggle
            />

            <GlassInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="Confirm your password"
              disabled={isLoading}
              showPasswordToggle
            />

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </GlassButton>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign In
              </Link>
            </p>
            <Link
              href="/"
              className="text-sm text-white/60 hover:text-white transition-colors block"
            >
              Back to Home
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

