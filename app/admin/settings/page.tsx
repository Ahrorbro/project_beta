import { requireRole } from "@/lib/middleware";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Settings, User, Shield, Bell } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireRole("SUPER_ADMIN");

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-white/60">Manage system settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Account Settings</h2>
            </div>
            <p className="text-white/60 mb-4">
              Super Admin account information and preferences.
            </p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Email</p>
                <p className="text-white font-medium">ahrorbek@rentify.com</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Role</p>
                <p className="text-white font-medium">Super Admin</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Security</h2>
            </div>
            <p className="text-white/60 mb-4">
              Security and compliance settings.
            </p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Data Protection</p>
                <p className="text-white font-medium">Tanzanian PDPA Compliant</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Audit Logging</p>
                <p className="text-white font-medium">Enabled</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            <p className="text-white/60 mb-4">
              System-wide notification settings.
            </p>
            <p className="text-sm text-white/40">
              Notification management features coming soon.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">System Configuration</h2>
            </div>
            <p className="text-white/60 mb-4">
              Platform-wide configuration settings.
            </p>
            <p className="text-sm text-white/40">
              System configuration features coming soon.
            </p>
          </GlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}

