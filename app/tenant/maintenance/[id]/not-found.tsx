import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className="text-center max-w-md">
        <Wrench className="w-16 h-16 mx-auto mb-4 text-white/40" />
        <h1 className="text-4xl font-bold mb-4 text-red-400">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Request Not Found</h2>
        <p className="text-white/60 mb-8">
          The maintenance request you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/tenant/maintenance">
          <GlassButton variant="primary">Back to Maintenance</GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
}

