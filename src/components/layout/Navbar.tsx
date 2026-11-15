import React, { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { type AppRole, roleLabels } from "@/lib/pharmtrace-data";
import {
  Shield,
  Activity,
  Scan,
  ShoppingCart,
  Menu,
  X,
  Building2,
  Store,
  FileCheck2,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarcodeScanner } from "@/components/pharmtrace/BarcodeScanner";

export const Navbar: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const currentRole = useStore((s) => s.currentRole);
  const setRole = useStore((s) => s.setRole);
  const session = useStore((s) => s.session);
  const cart = useStore((s) => s.cart);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickScanOpen, setQuickScanOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: "Overview", to: "/" },
    { label: "Manufacturer Hub", to: "/dashboard/manufacturer", icon: Building2 },
    { label: "Pharmacy & Market", to: "/dashboard/pharmacy", icon: Store },
    { label: "NAFDAC Auditor", to: "/dashboard/regulator", icon: FileCheck2 },
    { label: "Admin Console", to: "/dashboard/admin", icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md supports-backdrop-filter:bg-white/85">
      {/* Top Nigeria Compliance Bar */}
      <div className="bg-emerald-950 text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-200">FEDERAL REPUBLIC OF NIGERIA</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline">
            NAFDAC GS1 National Traceability & Pharmacovigilance Network
          </span>
        </div>
        <div className="flex items-center gap-3 text-emerald-300 font-mono text-[10px]">
          <span className="hidden md:inline">GS1 Healthcare EPCIS 1.2</span>
          <span>Node: LAGOS-DC01 [ONLINE]</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Pharm<span className="text-emerald-800">Trace</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  NG
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                Verified Pharmaceutical Supply Chain
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Scanner Modal Launcher */}
            <Dialog open={quickScanOpen} onOpenChange={setQuickScanOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs h-9 px-3.5 shadow-sm flex items-center gap-1.5"
                >
                  <Scan className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Scan & Verify</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 overflow-hidden border-none">
                <DialogHeader className="sr-only">
                  <DialogTitle>Instant 2D DataMatrix Verification</DialogTitle>
                </DialogHeader>
                <BarcodeScanner onScanComplete={() => {}} />
              </DialogContent>
            </Dialog>

            {/* Cart Link (Pharmacy B2B) */}
            <Link to="/dashboard/pharmacy">
              <Button
                variant="outline"
                size="sm"
                className="relative h-9 px-2.5 sm:px-3 text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
                <span className="hidden md:inline ml-1 text-xs">Market Cart</span>
              </Button>
            </Link>

            {/* Role Switcher Persona Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2 sm:px-3 text-xs border-slate-300 bg-slate-50/80 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="max-w-[120px] truncate hidden sm:inline font-medium text-slate-800">
                    {session.name.split(",")[0]}
                  </span>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1 font-semibold uppercase bg-white border border-slate-200">
                    {currentRole}
                  </Badge>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2">
                <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                  Active Persona & Organization
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">
                    {session.name}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">{session.organizationName}</div>
                  <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                    License: {session.licenseNumber}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] uppercase font-bold text-slate-400">
                  Switch Active Role (Demo Persona)
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setRole("manufacturer")}
                  className={`cursor-pointer text-xs ${currentRole === "manufacturer" ? "bg-emerald-50 font-bold text-emerald-900" : ""}`}
                >
                  <Building2 className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                  <div>
                    <div>Manufacturer (Emzor Pharma)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Serialization & Event Hub</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRole("pharmacy")}
                  className={`cursor-pointer text-xs ${currentRole === "pharmacy" ? "bg-emerald-50 font-bold text-emerald-900" : ""}`}
                >
                  <Store className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                  <div>
                    <div>Pharmacy (Medplus Lekki)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Verification, B2B & Working Capital</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRole("regulator")}
                  className={`cursor-pointer text-xs ${currentRole === "regulator" ? "bg-emerald-50 font-bold text-emerald-900" : ""}`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                  <div>
                    <div>Regulatory Auditor (NAFDAC)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Audit Trails & 48-Hour Incident Logs</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRole("super_admin")}
                  className={`cursor-pointer text-xs ${currentRole === "super_admin" ? "bg-emerald-50 font-bold text-emerald-900" : ""}`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                  <div>
                    <div>Super Admin</div>
                    <div className="text-[10px] text-slate-500 font-normal">Platform & Tenant Governance</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const isActive = currentPath === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-emerald-800" />}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
