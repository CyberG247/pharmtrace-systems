import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useStore } from "@/lib/store";
import {
  type Organization,
  type AppRole,
  roleLabels,
} from "@/lib/pharmtrace-data";
import {
  SlidersHorizontal,
  Building2,
  Store,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  Server,
  Layers,
  Search,
  Plus,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Super Admin & National Trust Mesh Console | PharmTrace Systems" },
      {
        name: "description",
        content:
          "Tenant organization management, PCN/NAFDAC license verification, RBAC role matrix, and ledger health governance.",
      },
    ],
  }),
});

function AdminDashboard() {
  const session = useStore((s) => s.session);
  const organizations = useStore((s) => s.organizations);
  const batches = useStore((s) => s.batches);
  const products = useStore((s) => s.products);
  const incidents = useStore((s) => s.incidents);
  const resetToDefaults = useStore((s) => s.resetToDefaults);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8">
        {/* Admin Header with Mesh Motif */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle medical background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-molecular-dark opacity-25 pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
              <SlidersHorizontal className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  PharmTrace National Trust Mesh Administration
                </h1>
                <Badge className="bg-emerald-800 text-emerald-200 border-emerald-600 text-xs">
                  SUPER ADMIN
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Root System Administrator: <strong className="text-white">{session.name}</strong></span>
                <span>•</span>
                <span>Tenant Isolation: Enforced</span>
              </p>

              {/* Compliance Stamps */}
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <Badge variant="outline" className="bg-emerald-950/80 text-emerald-300 border-emerald-600/50 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> NAFDAC & PCN Registered Node
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
                  Multi-Tenant RBAC Active
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetToDefaults();
                toast.success("Demo State Reset to Default Seed Data");
              }}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs h-9"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Demo Seed Data
            </Button>
          </div>
        </div>

        {/* 4 Macro Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Verified Tenants</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {organizations.length} Organizations
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Manufacturers, Distributors, Pharmacies
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Registered Products</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {products.length} Drug SKUs
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              100% NAFDAC Reg. Numbers Validated
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Active Serialized Batches</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {batches.length} Lots
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Unit serialization across Nigeria
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Ledger Node Status</span>
              <Server className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              Healthy (99.98%)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Multi-Region Cloud Mesh
            </div>
          </div>
        </div>

        {/* Tabbed Admin View */}
        <Tabs defaultValue="organizations" className="space-y-6">
          <TabsList className="bg-slate-200/80 p-1 rounded-xl">
            <TabsTrigger value="organizations" className="text-xs sm:text-sm font-semibold">
              <Building2 className="w-4 h-4 mr-1.5" /> Registered Organizations & Tenants
            </TabsTrigger>
            <TabsTrigger value="rbac" className="text-xs sm:text-sm font-semibold">
              <Key className="w-4 h-4 mr-1.5" /> RBAC Role & Permission Matrix
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ORGANIZATIONS */}
          <TabsContent value="organizations" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, license, or state..."
                    className="pl-9 text-xs sm:text-sm bg-slate-50"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Showing {filteredOrgs.length} tenant organizations
                </div>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-3">Organization Name</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Official License No</th>
                      <th className="py-3 px-3">State / City</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-1.5 mt-1.5">
                          {org.type === "manufacturer" ? (
                            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : org.type === "pharmacy" ? (
                            <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          )}
                          <span>{org.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="capitalize text-[10px] font-medium">
                            {org.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {org.licenseNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {org.city}, {org.state}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {org.contactEmail}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (< 768px) */}
              <div className="md:hidden space-y-3">
                {filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {org.type === "manufacturer" ? (
                          <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : org.type === "pharmacy" ? (
                          <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : (
                          <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                        <span className="font-bold text-xs text-slate-900">{org.name}</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px] font-medium">
                        {org.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block">License No:</span>
                        <span className="font-mono font-bold text-slate-800">{org.licenseNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Location:</span>
                        <span className="text-slate-700">{org.city}, {org.state}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-mono">{org.contactEmail}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: RBAC MATRIX */}
          <TabsContent value="rbac" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Role-Based Access Control (RBAC) Governance Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Enforces strict tenant isolation and role separation mandated by NAFDAC security protocols.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Role Designation</th>
                      <th className="py-3 px-4">Serialization & Commissioning</th>
                      <th className="py-3 px-4">Point-of-Sale Verification</th>
                      <th className="py-3 px-4">B2B Procurement & BNPL</th>
                      <th className="py-3 px-4">Emergency Recall & Quarantine</th>
                      <th className="py-3 px-4">Tenant Administration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Manufacturer / Distributor
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">✓ Full Access</td>
                      <td className="py-3 px-4 text-slate-400">Read-Only</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">✓ Supplier View</td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-slate-400">Org Level</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Community Pharmacy / PPMV
                      </td>
                      <td className="py-3 px-4 text-slate-400">—</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">✓ Full Scanner</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">✓ Buyer View & BNPL</td>
                      <td className="py-3 px-4 text-slate-400">48-Hr Filing Only</td>
                      <td className="py-3 px-4 text-slate-400">Branch Level</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Regulatory Auditor (NAFDAC)
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Audit View</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Audit View</td>
                      <td className="py-3 px-4 text-slate-400">Transaction Audit</td>
                      <td className="py-3 px-4 text-red-600 font-bold">✓ Nationwide Directives</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">License Audit</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Super Admin
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">System Override</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">System Override</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">Facility Audit</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">System Override</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">✓ Full Governance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
