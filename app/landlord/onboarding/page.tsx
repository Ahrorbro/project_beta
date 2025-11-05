import { redirect } from "next/navigation";
import { requireRole } from "@/lib/middleware";
import { prismaQuery as prisma } from "@/lib/prisma";
import { LandlordOnboardingForm } from "@/components/landlord/LandlordOnboardingForm";

export default async function LandlordOnboardingPage() {
  const session = await requireRole("LANDLORD");

  const landlord = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (landlord?.landlordProfileComplete) {
    redirect("/landlord/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <LandlordOnboardingForm landlord={landlord} />
      </div>
    </div>
  );
}

