import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { RecordPaymentForm } from "@/components/landlord/RecordPaymentForm";
import { prismaQuery as prisma } from "@/lib/prisma";

export default async function RecordPaymentPage() {
  const session = await requireRole("LANDLORD");

  // Get all units for the landlord
  const units = (await prisma.unit.findMany({
    where: {
      property: {
        landlordId: session.user.id,
      },
      isOccupied: true,
    },
    select: {
      id: true,
      unitNumber: true,
      rentAmount: true,
      property: {
        select: {
          address: true,
        },
      },
      tenants: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: [
      {
        property: {
          address: "asc",
        },
      },
      {
        unitNumber: "asc",
      },
    ],
  })) as unknown as Array<{
    id: string;
    unitNumber: string;
    rentAmount: number;
    property: {
      address: string;
    };
    tenants: Array<{
      id: string;
      tenant: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
  }>;

  return (
    <LandlordLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            Record Payment
          </h1>
          <p className="text-white/60">Record a payment for a tenant</p>
        </div>
        <RecordPaymentForm units={units} />
      </div>
    </LandlordLayout>
  );
}

