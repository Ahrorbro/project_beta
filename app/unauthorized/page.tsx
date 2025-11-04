import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-red-400">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Unauthorized Access</h2>
        <p className="text-white/60 mb-8">
          You don't have permission to access this page.
        </p>
        <Link href="/">
          <GlassButton variant="primary">Go Home</GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
}

