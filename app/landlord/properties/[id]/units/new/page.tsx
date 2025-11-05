import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CreateUnitForm } from "@/components/landlord/CreateUnitForm";

interface CreateUnitPageProps {
  params: {
    id: string;
  };
}

export default async function CreateUnitPage({ params }: CreateUnitPageProps) {
  const session = await requireRole("LANDLORD");

  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      landlordId: session.user.id,
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <LandlordLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Add Unit
          </h1>
          <p className="text-white/60">Add a new unit to {property.address}</p>
        </div>
        <CreateUnitForm propertyId={property.id} />
      </div>
    </LandlordLayout>
  );
}

