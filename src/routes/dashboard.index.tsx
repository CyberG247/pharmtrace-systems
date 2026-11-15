import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Building2, Store, FileCheck2, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
  head: () => ({
    meta: [
      { title: "Dashboard Hub | PharmTrace Systems" },
    ],
  }),
});

function DashboardIndex() {
  const currentRole = useStore((s) => s.currentRole);
  const session = useStore((s) => s.session);
  const setRole = useStore((s) => s.setRole);

  const portals = [
    {
      role: "manufacturer" as const,
      title: "Manufacturer Serialization Hub",
      description: "GS1 DataMatrix generator, bulk serial export, EPCIS event logging, and NAFDAC compliance score.",
      href: "/dashboard/manufacturer",
      icon: Building2,
      badge: "PRODUCTION & PACKAGING",
    },
    {
      role: "pharmacy" as const,
      title: "Pharmacy Verification & B2B Portal",
      description: "Point-of-dispense 2D scanner, direct genuine manufacturer restock, and ₦15M BNPL working capital.",
      href: "/dashboard/pharmacy",
      icon: Store,
      badge: "DISPENSING & PROCUREMENT",
    },
    {
      role: "regulator" as const,
      title: "NAFDAC Regulatory Auditor",
      description: "Inspect chain-of-custody, trace suspect lots, review 48-hour error incident queue, and enforce recalls.",
      href: "/dashboard/regulator",
      icon: FileCheck2,
      badge: "POST-MARKET SURVEILLANCE",
    },
    {
      role: "super_admin" as const,
      title: "National Trust Mesh Admin",
      description: "Manage tenant organizations, verify PCN and NAFDAC premises licenses, and monitor ledger health.",
      href: "/dashboard/admin",
      icon: SlidersHorizontal,
      badge: "SYSTEM GOVERNANCE",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3">
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-xs">
            Multi-Tenant Operational Hub
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            PharmTrace Portals
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Logged in as <strong className="text-slate-900">{session.name}</strong> ({session.organizationName}). Select an operational console to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => (
            <div
              key={portal.role}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                currentRole === portal.role
                  ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center">
                    <portal.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {portal.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{portal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{portal.description}</p>
              </div>

              <div className="pt-2">
                <Link
                  to={portal.href}
                  onClick={() => setRole(portal.role)}
                >
                  <Button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold h-9">
                    Open Console <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
