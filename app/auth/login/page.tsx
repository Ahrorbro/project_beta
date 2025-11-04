"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (session.user.role === "LANDLORD") {
        router.push("/landlord/dashboard");
      } else if (session.user.role === "TENANT") {
        router.push("/tenant/dashboard");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }
      
      if (result?.ok) {
        toast.success("Login successful!");
        
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fetch session to get user role
        try {
          const sessionRes = await fetch("/api/auth/session", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });
          
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            
            if (sessionData?.user?.role === "SUPER_ADMIN") {
              router.push("/admin/dashboard");
            } else if (sessionData?.user?.role === "LANDLORD") {
              router.push("/landlord/dashboard");
            } else if (sessionData?.user?.role === "TENANT") {
              router.push("/tenant/dashboard");
            } else {
              router.push("/");
            }
            router.refresh();
          } else {
            // Fallback: let the useEffect handle redirect based on session
            router.refresh();
          }
        } catch (sessionError) {
          console.error("Session fetch error:", sessionError);
          // Fallback: refresh and let useEffect handle redirect
          router.refresh();
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
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
            <p className="text-white/60">Welcome back</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />

            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
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
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </GlassButton>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-white/60">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign Up
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

