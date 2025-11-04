import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Building2 } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h1 className="text-4xl font-bold mb-4 text-white">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-white">Property Not Found</h2>
        <p className="text-white/60 mb-8">
          The property you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/admin/landlords">
            <GlassButton variant="primary">Back to Landlords</GlassButton>
          </Link>
          <Link href="/admin/dashboard">
            <GlassButton variant="secondary">Dashboard</GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

