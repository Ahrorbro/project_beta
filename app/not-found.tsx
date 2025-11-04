import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h1 className="text-4xl font-bold mb-4 text-white">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-white">Page Not Found</h2>
        <p className="text-white/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <GlassButton variant="primary">Go Home</GlassButton>
          </Link>
          <Link href="/auth/login">
            <GlassButton variant="secondary">Sign In</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

