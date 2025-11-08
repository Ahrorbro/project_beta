"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Wrench,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  Bell
} from "lucide-react";

interface LandlordLayoutProps {
  children: ReactNode;
}

export function LandlordLayout({ children }: LandlordLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const navItems = [
    { href: "/landlord/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/landlord/properties", icon: Building2, label: "Properties" },
    { href: "/landlord/tenants", icon: Users, label: "Tenants" },
    { href: "/landlord/payments", icon: CreditCard, label: "Payments" },
    { href: "/landlord/maintenance", icon: Wrench, label: "Maintenance" },
    { href: "/landlord/announcements", icon: Bell, label: "Announcements" },
    { href: "/landlord/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden glass-dark border-b border-white/10 p-4 flex items-center justify-between">
        <Link href="/landlord/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rentify
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        top-0 left-0 z-50
        w-64 h-full lg:h-auto
        glass-dark border-r border-white/10 p-6 flex flex-col
        transition-transform duration-300 ease-in-out
      `}>
        <div className="mb-8">
          <Link href="/landlord/dashboard" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Rentify
            </span>
          </Link>
          <p className="text-sm text-white/60">Landlord Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="mb-4 px-4 py-2 rounded-lg bg-white/5">
            <p className="text-sm text-white/60">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

