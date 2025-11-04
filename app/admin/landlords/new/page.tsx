import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CreateLandlordForm } from "@/components/admin/CreateLandlordForm";

export default async function CreateLandlordPage() {
  await requireRole("SUPER_ADMIN");

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create New Landlord
          </h1>
          <p className="text-white/60">Assign credentials and create a new landlord account</p>
        </div>
        <CreateLandlordForm />
      </div>
    </AdminLayout>
  );
}

