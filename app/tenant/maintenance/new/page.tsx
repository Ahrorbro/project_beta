import { requireRole } from "@/lib/middleware";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { CreateMaintenanceRequestForm } from "@/components/tenant/CreateMaintenanceRequestForm";

export default async function NewMaintenanceRequestPage() {
  await requireRole("TENANT");

  return (
    <TenantLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            New Maintenance Request
          </h1>
          <p className="text-white/60">Submit a maintenance request with photos</p>
        </div>
        <CreateMaintenanceRequestForm />
      </div>
    </TenantLayout>
  );
}

