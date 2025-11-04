import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-4xl">
        <GlassCard>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Terms & Conditions
            </h1>
            <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Rentify, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily use Rentify for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. User Responsibilities</h2>
              <p className="mb-4">
                Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Payment Terms</h2>
              <p className="mb-4">
                Payment terms are specified in the subscription plan selected. All payments are processed securely and in accordance with Tanzanian law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Protection</h2>
              <p className="mb-4">
                We are committed to protecting your personal data in accordance with the Tanzanian Personal Data Protection Act (PDPA). For more information, please see our Privacy Policy.
              </p>
            </section>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/">
              <GlassButton variant="secondary">Back to Home</GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

