import { requireRole } from "@/lib/middleware";
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { CreatePropertyForm } from "@/components/landlord/CreatePropertyForm";

export default async function CreatePropertyPage() {
  await requireRole("LANDLORD");

  return (
    <LandlordLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Add New Property
          </h1>
          <p className="text-white/60">Create a new rental property</p>
        </div>
        <CreatePropertyForm />
      </div>
    </LandlordLayout>
  );
}

