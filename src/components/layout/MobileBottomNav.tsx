import React, { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import {
  Scan,
  Store,
  Building2,
  FileCheck2,
  SlidersHorizontal,
  UserCheck,
  Receipt,
  Pill,
  ShieldCheck,
  QrCode,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarcodeScanner } from "@/components/pharmtrace/BarcodeScanner";

export const MobileBottomNav: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const currentRole = useStore((s) => s.currentRole);
  const setRole = useStore((s) => s.setRole);
  const session = useStore((s) => s.session);
  const cart = useStore((s) => s.cart);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Role dashboard target
  const dashboardLink =
    currentRole === "manufacturer"
      ? "/dashboard/manufacturer"
      : currentRole === "pharmacy"
      ? "/dashboard/pharmacy"
      : currentRole === "regulator"
      ? "/dashboard/regulator"
      : "/dashboard/admin";

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around safe-area-bottom"
      >
        {/* 1. Hub / Dashboard */}
        <Link
          to={dashboardLink}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            currentPath.startsWith("/dashboard") && currentPath !== "/dashboard/pharmacy"
              ? "text-emerald-900 font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {currentRole === "manufacturer" ? (
            <Building2 className="w-5 h-5" />
          ) : currentRole === "regulator" ? (
            <FileCheck2 className="w-5 h-5" />
          ) : currentRole === "super_admin" ? (
            <SlidersHorizontal className="w-5 h-5" />
          ) : (
            <Building2 className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-1 tracking-tight leading-none">Hub</span>
        </Link>

        {/* 2. B2B Marketplace */}
        <Link
          to="/dashboard/pharmacy"
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 relative ${
            currentPath === "/dashboard/pharmacy"
              ? "text-emerald-900 font-bold"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">B2B Market</span>
        </Link>

        {/* 3. Center Floating Scanner Action (Touch First) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            aria-label="Open Mobile GS1 Scanner"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex items-center justify-center shadow-lg shadow-emerald-950/30 border-4 border-slate-50 ring-2 ring-emerald-500/20 active:scale-90 transition-transform cursor-pointer"
          >
            <Scan className="w-6 h-6 text-emerald-300 animate-pulse" />
          </button>
          <span className="text-[10px] font-bold text-emerald-950 mt-0.5">Scan 2D</span>
        </div>

        {/* 4. Orders / Audit Pedigree */}
        <Link
          to={currentRole === "regulator" ? "/dashboard/regulator" : "/dashboard/pharmacy"}
          className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
            currentPath.includes("orders") ? "text-emerald-900 font-bold" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight leading-none">Pedigree</span>
        </Link>

        {/* 5. Role Persona Switcher */}
        <button
          type="button"
          onClick={() => setPersonaOpen(true)}
          className="flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <UserCheck className="w-5 h-5 text-emerald-800" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none font-medium capitalize">
            {currentRole === "super_admin" ? "Admin" : currentRole}
          </span>
        </button>
      </nav>

      {/* Full-Screen Mobile Optical Scanner Modal */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="p-0 sm:max-w-2xl max-w-full h-full sm:h-auto overflow-y-auto border-none sm:rounded-2xl rounded-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Point-of-Dispense GS1 DataMatrix Scanner</DialogTitle>
          </DialogHeader>
          <div className="relative min-h-[500px]">
            <BarcodeScanner
              onScanComplete={() => {}}
              className="border-none shadow-none rounded-none sm:rounded-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Persona Switcher Sheet Modal */}
      <Dialog open={personaOpen} onOpenChange={setPersonaOpen}>
        <DialogContent className="max-w-md p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800" />
              Active Organization & Stakeholder Persona
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Currently Operating As:
              </span>
              <div className="font-extrabold text-sm text-slate-900 mt-0.5">{session.name}</div>
              <div className="text-xs text-slate-700 font-semibold">{session.organizationName}</div>
              <div className="text-[10px] font-mono text-emerald-800 font-bold mt-1">
                License: {session.licenseNumber}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                Switch Operational Persona:
              </span>

              <button
                type="button"
                onClick={() => {
                  setRole("manufacturer");
                  setPersonaOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currentRole === "manufacturer"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold">Manufacturer (Emzor Pharma)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Serialization Line & EPCIS Events</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-800 border-emerald-300">
                  Plant
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("pharmacy");
                  setPersonaOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currentRole === "pharmacy"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold">Community Pharmacy (Medplus)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Floor Scanner & ₦15M BNPL Line</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-800 border-emerald-300">
                  Dispenser
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("regulator");
                  setPersonaOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currentRole === "regulator"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold">Regulatory Auditor (NAFDAC)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Audit Trails & 48-Hr Incident Queue</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-800 border-emerald-300">
                  Auditor
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("super_admin");
                  setPersonaOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currentRole === "super_admin"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="text-xs font-bold">Super Admin (National Mesh)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Tenant Isolation & Node Governance</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-800 border-emerald-300">
                  Root
                </Badge>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
