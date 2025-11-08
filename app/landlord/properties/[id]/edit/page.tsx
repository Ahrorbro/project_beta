import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { prismaQuery as prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditPropertyForm } from "@/components/landlord/EditPropertyForm";

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const session = await requireRole("LANDLORD");

  const property = await prisma.property.findFirst({
    where: {
      id: params.id,
      landlordId: session.user.id,
    },
    select: {
      id: true,
      address: true,
      location: true,
      propertyType: true,
      description: true,
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <LandlordLayout>
      <div className="space-y-8">
        <div>
          <Link
            href={`/landlord/properties/${property.id}`}
            className="text-white/60 hover:text-white mb-4 inline-block transition-colors"
          >
            ← Back to Property
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-white">Edit Property</h1>
          <p className="text-white/60">Update property details</p>
        </div>

        <EditPropertyForm property={property} />
      </div>
    </LandlordLayout>
  );
}

