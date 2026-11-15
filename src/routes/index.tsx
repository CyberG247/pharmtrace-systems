import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarcodeScanner } from "@/components/pharmtrace/BarcodeScanner";
import { useStore } from "@/lib/store";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Store,
  FileCheck2,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  QrCode,
  Truck,
  CreditCard,
  Lock,
  ChevronRight,
  Layers,
  Sparkles,
  AlertTriangle,
  Zap,
  Activity,
  Award,
  PhoneCall,
  Pill,
  FlaskConical,
  Syringe,
  Cross,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PharmTrace Systems | Nigeria GS1 Pharmaceutical Traceability & B2B Procurement" },
      {
        name: "description",
        content:
          "Enterprise pharmaceutical traceability platform for Nigeria. Unit serialization with GS1 DataMatrix, NAFDAC regulatory compliance, verified B2B procurement and healthcare working capital.",
      },
    ],
  }),
});

function Index() {
  const setRole = useStore((s) => s.setRole);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 pb-24 md:pb-0">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32">
          {/* Subtle medical molecular pattern overlay */}
          <div className="absolute inset-0 opacity-15 bg-molecular-dark pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* National Mandate & Compliance Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>NAFDAC GS1 Mandate 2026/2027 Ready</span>
                  <span className="text-emerald-400">•</span>
                  <span className="font-semibold">Federal Republic of Nigeria</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>ISO/IEC 16022 2D Serialized</span>
                </div>
              </div>

              {/* High-Impact Value Proposition Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Next-Generation Pharmaceutical{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  Traceability & Verified
                </span>{" "}
                Supply Chain for Nigeria
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
                Empowering manufacturers, distributors, and licensed community pharmacies across Nigeria with GS1 DataMatrix unit serialization, real-time EPCIS event logging, NAFDAC regulatory compliance, and a verified B2B procurement & working capital layer.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
                <Link
                  to="/dashboard/manufacturer"
                  onClick={() => setRole("manufacturer")}
                >
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base px-6 py-6 h-auto shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Request Manufacturer Access
                  </Button>
                </Link>

                <Link
                  to="/dashboard/pharmacy"
                  onClick={() => setRole("pharmacy")}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-400/50 bg-emerald-950/60 hover:bg-emerald-900 text-white font-semibold text-sm sm:text-base px-6 py-6 h-auto backdrop-blur-sm active:scale-[0.98] transition-all"
                  >
                    <Store className="w-5 h-5 mr-2 text-emerald-400" />
                    Pharmacy Portal Login
                  </Button>
                </Link>

                <Link
                  to="/dashboard/regulator"
                  onClick={() => setRole("regulator")}
                >
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10 text-sm sm:text-base px-4 py-6 h-auto active:scale-[0.98] transition-all"
                  >
                    <FileCheck2 className="w-5 h-5 mr-1.5 text-emerald-400" />
                    Auditor Console
                  </Button>
                </Link>
              </div>

              {/* Live Trust Badges & Stats Bar */}
              <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
                    14.8M+
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-semibold">
                    Serialized Packs Tracked
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
                    4,200+
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-semibold">
                    Verified Pharmacies & PPMVs
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono">
                    1,840+
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-semibold">
                    Falsified Packs Intercepted
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
                    99.4%
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-semibold">
                    NAFDAC Mandate Readiness
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NAFDAC MANDATE COUNTDOWN & URGENCY STRIP */}
        <section className="bg-emerald-900 border-y border-emerald-800 py-4 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-emerald-800 text-emerald-300 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <span className="font-bold text-white">
                  Regulatory Notice: NAFDAC 5-Year Traceability Mandate Enforcement
                </span>
                <p className="text-emerald-200 text-xs">
                  All local pharmaceutical manufacturers and importers must implement GS1 DataMatrix 2D serialization and EPCIS chain-of-custody reporting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="bg-emerald-950 text-emerald-300 border-emerald-500 font-mono py-1 px-3">
                Mandate Deadline: Active Rollout
              </Badge>
              <Link to="/dashboard/manufacturer" className="text-xs font-bold underline hover:text-emerald-200">
                Check Facility Readiness →
              </Link>
            </div>
          </div>
        </section>

        {/* LIVE INTERACTIVE GS1 SCANNER DEMO */}
        <section className="py-16 sm:py-20 bg-slate-100/70 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-10">
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 uppercase tracking-wider text-xs font-bold">
                Interactive Verification Engine
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                Test Real-Time Verification Right Now
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Simulate scanning genuine pharmaceutical packs from Emzor and Fidson, or click the <strong className="text-red-700">Counterfeit Pack button</strong> to see PharmTrace’s instant crimson alert and automatic 48-hour NAFDAC reporting in action.
              </p>
            </div>

            <BarcodeScanner />
          </div>
        </section>

        {/* INTERACTIVE FEATURE SHOWCASE TABS */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 uppercase tracking-wider text-xs font-bold">
                Interactive Feature Architecture
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Complete End-to-End Pharmaceutical Traceability
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Click through the interactive showcase tabs below to explore how PharmTrace secures every link of Nigeria's medical supply chain.
              </p>
            </div>

            <Tabs defaultValue="serialization-feat" className="space-y-8 max-w-5xl mx-auto">
              <TabsList className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-1">
                <TabsTrigger value="serialization-feat" className="text-xs sm:text-sm font-bold py-2.5">
                  <QrCode className="w-4 h-4 mr-1.5" /> 1. Serialization
                </TabsTrigger>
                <TabsTrigger value="epcis-feat" className="text-xs sm:text-sm font-bold py-2.5">
                  <Truck className="w-4 h-4 mr-1.5" /> 2. EPCIS Tracking
                </TabsTrigger>
                <TabsTrigger value="market-feat" className="text-xs sm:text-sm font-bold py-2.5">
                  <Store className="w-4 h-4 mr-1.5" /> 3. B2B Market
                </TabsTrigger>
                <TabsTrigger value="bnpl-feat" className="text-xs sm:text-sm font-bold py-2.5">
                  <CreditCard className="w-4 h-4 mr-1.5" /> 4. Working Capital
                </TabsTrigger>
              </TabsList>

              {/* TAB 1 */}
              <TabsContent value="serialization-feat" className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xs">
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-emerald-800 border-emerald-300 text-xs font-bold">
                      ISO/IEC 16022 & GS1 HEALTHCARE
                    </Badge>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      Unit-Level 2D DataMatrix Serialization
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Every individual blister pack, syrup bottle, and injectable vial receives a unique cryptographic serial number alongside its 14-digit GTIN, batch number, and expiration date.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mathematical GTIN-14 check-digit verification
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High-speed bulk CSV export for packaging line printers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated synchronization with NAFDAC MAS Registry
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/dashboard/manufacturer" onClick={() => setRole("manufacturer")}>
                        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]">
                          Test Batch Generator →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      (01)05012345678900(17)281231(10)LOT-EMZ01(21)PT-EMZ-9041
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="w-32 h-32 bg-slate-900 text-white flex items-center justify-center rounded-lg shadow-inner">
                        <QrCode className="w-20 h-20 text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">Human-Readable & Machine-Scannable Dual Encoding</span>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2 */}
              <TabsContent value="epcis-feat" className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xs">
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-emerald-800 border-emerald-300 text-xs font-bold">
                      CHAIN OF CUSTODY INTEGRITY
                    </Badge>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      EPCIS Standard Event Logging
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Supply chain events—Commissioning, Shipper Packing, Freight Dispatch, and Inbound Depot Receipt—are recorded on an immutable ledger with temperature logs and tamper seals.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prevents illicit diversion to unregulated open markets
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cold-chain deviation logging (2°C - 8°C thermal telemetry)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Signed by authorized Pharmacists & Logistics Supervisors
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/dashboard/manufacturer" onClick={() => setRole("manufacturer")}>
                        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]">
                          View Custody Logger →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Sample Handoff Pipeline:
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg font-medium flex justify-between">
                        <span>1. Commissioned at Emzor Ikeja Plant</span>
                        <span className="font-mono text-[10px]">09:30 AM</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg font-medium flex justify-between">
                        <span>2. Aggregated into Shipper Case #SSCC-449</span>
                        <span className="font-mono text-[10px]">02:15 PM</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg font-medium flex justify-between">
                        <span>3. Dispatched via Medsaf Logistics Van</span>
                        <span className="font-mono text-[10px]">08:45 AM</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg font-medium flex justify-between">
                        <span>4. Received at Medplus Lekki Flagship</span>
                        <span className="font-mono text-[10px]">04:20 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3 */}
              <TabsContent value="market-feat" className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xs">
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-emerald-800 border-emerald-300 text-xs font-bold">
                      VERIFIED B2B PROCUREMENT
                    </Badge>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      Direct-from-Manufacturer Purchasing
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Community pharmacies and licensed patent medicine vendors bypass predatory middlemen and grey-market traders, ordering directly from certified Nigerian factories with verified authenticity.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Emzor, Fidson, May & Baker, and Swipha direct catalog
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent bulk tiered wholesale pricing (MOQ 20-50 packs)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automatic pedigree issuance with delivery tracking
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/dashboard/pharmacy" onClick={() => setRole("pharmacy")}>
                        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]">
                          Explore Marketplace Catalog →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Featured Genuine Products:
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">Lonart DS Tablets</div>
                          <div className="text-slate-500">Emzor Pharma • NAFDAC 04-2198</div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">₦2,850/pk</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">Amoxil 500mg Capsules</div>
                          <div className="text-slate-500">Fidson Healthcare • NAFDAC 04-1029</div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">₦5,200/pk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4 */}
              <TabsContent value="bnpl-feat" className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xs">
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-emerald-800 border-emerald-300 text-xs font-bold">
                      HEALTHCARE FINTECH
                    </Badge>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      ₦15M Working Capital & BNPL Credit
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Ensures community pharmacies never stock out of essential antimalarials, antibiotics, and chronic care medications. Buy Now, Pay Later terms over 30 or 60 days powered by health financing partners.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant drawdown at checkout with zero collateral paperwork
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Underwritten by verified point-of-dispense scan velocity
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Flexible invoice repayment restores credit facility instantly
                      </li>
                    </ul>
                    <div className="pt-2">
                      <Link to="/dashboard/pharmacy" onClick={() => setRole("pharmacy")}>
                        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]">
                          Check Pharmacy Credit Facility →
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-md space-y-4 text-xs font-mono">
                    <div className="flex justify-between items-center text-emerald-300">
                      <span>FACILITY STATUS</span>
                      <span className="text-white font-bold">ACTIVE PRIME</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-300 font-sans block">Available Credit</span>
                      <span className="text-2xl font-extrabold text-white">₦8,450,000</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-800 text-[11px] text-emerald-300/80 font-sans">
                      Underwritten by Sterling HealthPay & Carbon Consortium
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* ROLE-BASED PORTAL TILES */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <Badge className="bg-emerald-800 text-emerald-200 border-emerald-600 uppercase tracking-wider text-xs font-bold">
                Operational Consoles
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Role-Based Consoles for Every Stakeholder
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Jump directly into any of the 4 operational portals to inspect workflows and live data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Manufacturer Card */}
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4 hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-600 font-bold">
                      MANUFACTURER
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-white">Manufacturer Hub</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate GS1 DataMatrix batches, log commissioning events, monitor compliance scores, and review batch distribution.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/dashboard/manufacturer" onClick={() => setRole("manufacturer")}>
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9 font-bold active:scale-[0.98]">
                      Launch Hub →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pharmacy Card */}
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4 hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-600 font-bold">
                      PHARMACY / PPMV
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-white">Pharmacy & B2B Portal</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instant point-of-dispense 2D scanner, direct genuine medicine restock ordering, and ₦15M working capital financing facility.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/dashboard/pharmacy" onClick={() => setRole("pharmacy")}>
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9 font-bold active:scale-[0.98]">
                      Enter Portal →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Regulator Card */}
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4 hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-600 font-bold">
                      NAFDAC AUDITOR
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-white">Regulatory Auditor</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect national chain-of-custody, trace suspect lots, review 48-hour error incident queue, and dispatch nationwide quarantine notices.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/dashboard/regulator" onClick={() => setRole("regulator")}>
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9 font-bold active:scale-[0.98]">
                      Access Inspectorate →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Super Admin Card */}
              <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4 hover:border-emerald-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-600 font-bold">
                      SUPER ADMIN
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-white">National Trust Mesh</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manage tenant licenses, approve manufacturer registrations, audit global cryptographic telemetry, and monitor node health.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/dashboard/admin" onClick={() => setRole("super_admin")}>
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9 font-bold active:scale-[0.98]">
                      Administer Platform →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NIGERIA NATIONAL CALL TO ACTION */}
        <section className="py-16 bg-emerald-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Secure Your Pharmaceutical Operations?
            </h2>
            <p className="text-sm sm:text-base text-emerald-200 max-w-2xl mx-auto font-medium">
              Join leading Nigerian manufacturers like Emzor, Fidson, and May & Baker, plus over 4,200 verified pharmacies building an unforgeable medicine supply chain.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link to="/dashboard/manufacturer" onClick={() => setRole("manufacturer")}>
                <Button size="lg" className="bg-white text-emerald-950 font-bold hover:bg-emerald-50 active:scale-[0.98]">
                  Onboard Your Manufacturing Plant
                </Button>
              </Link>
              <Link to="/dashboard/pharmacy" onClick={() => setRole("pharmacy")}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 active:scale-[0.98]">
                  Connect Community Pharmacy
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
