import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-4xl">
        <GlassCard>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Privacy Policy
            </h1>
            <p className="text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Property and unit information</li>
                <li>Payment and transaction data</li>
                <li>Maintenance request details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Process payments and transactions</li>
                <li>Send you notifications and updates</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Protection (PDPA Compliance)</h2>
              <p className="mb-4">
                In accordance with the Tanzanian Personal Data Protection Act, we:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process personal data lawfully and fairly</li>
                <li>Collect only necessary data</li>
                <li>Maintain accurate and up-to-date records</li>
                <li>Implement appropriate security measures</li>
                <li>Respect your data subject rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Your Rights</h2>
              <p className="mb-4">
                Under the PDPA, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Contact Us</h2>
              <p className="mb-4">
                For any questions about this Privacy Policy or to exercise your data subject rights, please contact us at support@rentify.com
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

