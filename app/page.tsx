import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import {
  Building2,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Wrench,
  FileText,
  BarChart3,
  Bell,
  Lock,
  Zap,
  Globe,
  TrendingUp,
  Calendar,
  MessageCircle,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Manage multiple properties and units with ease. Track occupancy, rent, and lease agreements all in one place.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Tenant Management",
      description: "Invite tenants with unique links, track payments, manage leases, and maintain clear communication.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description: "Monitor rent payments, track overdue accounts, and automate payment reminders.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Wrench,
      title: "Maintenance Requests",
      description: "Tenants submit requests with photos. Landlords track and resolve issues efficiently.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Lease Management",
      description: "Upload, store, and manage lease agreements digitally. Track renewal dates automatically.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into rental income, occupancy rates, and property performance.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const benefits = [
    "Streamline property operations",
    "Automated rent reminders",
    "Digital lease storage",
    "Maintenance request tracking",
    "Real-time payment status",
    "Comprehensive analytics",
  ];

  const userTypes = [
    {
      icon: Shield,
      title: "Super Admin",
      description: "Full system access and landlord management",
      features: ["Create landlord accounts", "Monitor all activities", "System-wide analytics"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Building2,
      title: "Landlords",
      description: "Manage properties, tenants, and payments",
      features: ["Property & unit management", "Tenant tracking", "Payment records"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Tenants",
      description: "Submit requests, view leases, and make payments",
      features: ["Maintenance requests", "Lease viewing", "Payment tracking"],
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6 shadow-glow">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Rentify
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
              Property Management Platform
            </p>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Streamline your rental property management in Tanzania. Manage properties, tenants, payments, and maintenance all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/login">
              <GlassButton variant="primary" size="lg" className="flex items-center gap-2 group">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </Link>
            <Link href="/auth/signup">
              <GlassButton variant="secondary" size="lg">
                Sign Up Free
              </GlassButton>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <GlassCard className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-white mb-1">100%</p>
              <p className="text-white/60 text-sm">Efficiency</p>
            </GlassCard>
            <GlassCard className="text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="text-3xl font-bold text-white mb-1">Tanzania</p>
              <p className="text-white/60 text-sm">Focused</p>
            </GlassCard>
            <GlassCard className="text-center">
              <Lock className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold text-white mb-1">PDPA</p>
              <p className="text-white/60 text-sm">Compliant</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to manage your rental properties efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <GlassCard key={index} className="group hover:scale-105 transition-transform">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-transparent to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              For Everyone
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Three user types, one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => {
              const Icon = userType.icon;
              return (
                <GlassCard key={index} className="relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${userType.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{userType.title}</h3>
                    <p className="text-white/70 mb-6">{userType.description}</p>
                    <ul className="space-y-2">
                      {userType.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/80">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Why Choose Rentify?
              </h2>
              <p className="text-xl text-white/70 mb-8">
                The all-in-one solution for property management in Tanzania
              </p>
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-white/90">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <GlassButton variant="primary" size="lg" className="flex items-center gap-2 w-fit">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </GlassButton>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                <p className="text-2xl font-bold text-white mb-1">14 Days</p>
                <p className="text-white/60 text-sm">Free Trial</p>
              </GlassCard>
              <GlassCard className="text-center">
                <Zap className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                <p className="text-2xl font-bold text-white mb-1">Fast</p>
                <p className="text-white/60 text-sm">Setup</p>
              </GlassCard>
              <GlassCard className="text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
                <p className="text-2xl font-bold text-white mb-1">24/7</p>
                <p className="text-white/60 text-sm">Support</p>
              </GlassCard>
              <GlassCard className="text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-orange-400" />
                <p className="text-2xl font-bold text-white mb-1">Real-time</p>
                <p className="text-white/60 text-sm">Updates</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join landlords across Tanzania who are streamlining their property management with Rentify
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <GlassButton variant="primary" size="lg" className="flex items-center gap-2 group">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </GlassButton>
                </Link>
                <Link href="/auth/login">
                  <GlassButton variant="secondary" size="lg">
                    Sign In
                  </GlassButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Rentify
                </span>
              </div>
              <p className="text-white/60 text-sm">
                Property Management Platform for Tanzania
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>Property Management</li>
                <li>Tenant Tracking</li>
                <li>Payment Processing</li>
                <li>Maintenance Requests</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm">
              © 2024 Rentify. All rights reserved. | PDPA Compliant
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
