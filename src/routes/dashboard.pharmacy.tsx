import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarcodeScanner } from "@/components/pharmtrace/BarcodeScanner";
import { useStore } from "@/lib/store";
import {
  type Product,
  formatNaira,
} from "@/lib/pharmtrace-data";
import {
  Scan,
  Store,
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Package,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  Receipt,
  Clock,
  Sparkles,
  Info,
  TrendingUp,
  FileCheck2,
  Pill,
  FlaskConical,
  Syringe,
  Cross,
  HeartPulse,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/pharmacy")({
  component: PharmacyDashboard,
  head: () => ({
    meta: [
      { title: "Pharmacy Verification, B2B Marketplace & Working Capital | PharmTrace" },
      {
        name: "description",
        content:
          "2D DataMatrix medicine verifier, verified manufacturer B2B procurement, and ₦15M working capital inventory financing.",
      },
    ],
  }),
});

function PharmacyDashboard() {
  const session = useStore((s) => s.session);
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateCartQuantity = useStore((s) => s.updateCartQuantity);
  const clearCart = useStore((s) => s.clearCart);
  const placeOrder = useStore((s) => s.placeOrder);
  const fintech = useStore((s) => s.fintech);
  const repayInvoice = useStore((s) => s.repayInvoice);
  const orders = useStore((s) => s.orders);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"bnpl_30" | "bnpl_60" | "prepaid">("bnpl_30");
  const [repayModalInvoice, setRepayModalInvoice] = useState<typeof fintech.activeInvoices[0] | null>(null);
  const [creditIncreaseOpen, setCreditIncreaseOpen] = useState(false);
  const [requestedIncrease, setRequestedIncrease] = useState("5000000");

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Credit utilization percentage
  const utilizationPct = Math.round((fintech.drawnBalance / fintech.creditLimit) * 100);

  // Filter products
  const categories = ["All", "Antimalarials", "Antibiotics", "Infusions & IV", "Respiratory"];
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (selectedPaymentMethod.startsWith("bnpl") && cartSubtotal > fintech.availableBalance) {
      toast.error("Insufficient BNPL Credit Limit", {
        description: `Order total (${formatNaira(cartSubtotal)}) exceeds your available credit line (${formatNaira(fintech.availableBalance)}). Please choose prepaid or repay outstanding invoices.`,
      });
      return;
    }

    const order = placeOrder(
      selectedPaymentMethod,
      `${session.organizationName}, Admiralty Way, Lekki Phase 1, Lagos`,
    );

    if (order) {
      setCartDrawerOpen(false);
      toast.success("Restock Order Dispatched", {
        description: `Order ${order.orderNumber} successfully routed to manufacturer under ${
          selectedPaymentMethod === "bnpl_60" ? "60-Day BNPL" : "30-Day BNPL"
        } terms.`,
      });
    }
  };

  const handleRepay = () => {
    if (!repayModalInvoice) return;
    repayInvoice(repayModalInvoice.id);
    toast.success("Repayment Confirmed", {
      description: `Invoice ${repayModalInvoice.invoiceNo} (${formatNaira(repayModalInvoice.amount)}) settled. Available credit limit restored!`,
    });
    setRepayModalInvoice(null);
  };

  const handleCreditIncreaseRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditIncreaseOpen(false);
    toast.success("Credit Line Increase Requested", {
      description: `Application for additional ${formatNaira(Number(requestedIncrease))} submitted to Sterling HealthPay & Carbon Consortium. Underwriting response within 2 hours based on dispensing velocity.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8">
        {/* Pharmacy Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Store className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {session.organizationName}
                </h1>
                <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono text-xs">
                  {session.licenseNumber}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Licensed Superintendent Pharmacist:{" "}
                <span className="font-semibold text-slate-800">{session.name}</span> • PCN Verified Premises
              </p>
            </div>
          </div>

          {/* Quick Credit Status Pill */}
          <div className="bg-emerald-950 text-white p-4 rounded-2xl flex items-center gap-5 border border-emerald-800/80 shadow-xs shrink-0">
            <div>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
                Available Working Capital (BNPL)
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {formatNaira(fintech.availableBalance)}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setCartDrawerOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-9 px-3.5 active:scale-[0.98] transition-all shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Cart ({cartCount})
            </Button>
          </div>
        </div>

        {/* 3 Main Consoles: Verifier, B2B Marketplace, Fintech Working Capital */}
        <Tabs defaultValue="scanner" className="space-y-6">
          <TabsList className="bg-slate-200/80 p-1 rounded-xl">
            <TabsTrigger value="scanner" className="text-xs sm:text-sm font-semibold">
              <Scan className="w-4 h-4 mr-1.5" /> Instant Barcode Verifier
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="text-xs sm:text-sm font-semibold">
              <Store className="w-4 h-4 mr-1.5" /> Verified B2B Marketplace
            </TabsTrigger>
            <TabsTrigger value="fintech" className="text-xs sm:text-sm font-semibold">
              <CreditCard className="w-4 h-4 mr-1.5" /> Working Capital & BNPL Tracker
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm font-semibold">
              <Receipt className="w-4 h-4 mr-1.5" /> Orders & Deliveries ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* SUB-VIEW 1: INSTANT BARCODE VERIFIER */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <strong className="font-semibold">Point-of-Dispense Verification Protocol:</strong> All antimalarials, antibiotics, and cardiovascular packs must be scanned before dispensing. The central trust mesh validates the GS1 DataMatrix code directly against the manufacturer’s commissioning record.
                </div>
              </div>

              <BarcodeScanner />
            </div>
          </TabsContent>

          {/* SUB-VIEW 2: VERIFIED B2B MARKETPLACE */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={activeCategory === cat ? "default" : "outline"}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs h-8 active:scale-[0.98] transition-all ${
                      activeCategory === cat
                        ? "bg-emerald-900 text-white hover:bg-emerald-800 font-bold"
                        : "text-slate-700 border-slate-300"
                    }`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search medicine or brand..."
                  className="pl-9 text-xs sm:text-sm bg-slate-50 border-slate-300"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                const isInfusion = product.category.includes("Infusion");
                const isSyrup = product.name.toLowerCase().includes("syrup") || product.genericName.toLowerCase().includes("suspension");

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                  >
                    <div className="p-5 space-y-3">
                      {/* Manufacturer Badge & Dosage Form */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] truncate max-w-[170px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                          <span className="truncate">{product.manufacturerName.split(" ")[0]} Verified Plant</span>
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-mono text-slate-700 bg-slate-100 flex items-center gap-1 shrink-0">
                          {isInfusion ? (
                            <Syringe className="w-3 h-3 text-emerald-700" />
                          ) : isSyrup ? (
                            <FlaskConical className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <Pill className="w-3 h-3 text-emerald-700" />
                          )}
                          <span>{product.category}</span>
                        </Badge>
                      </div>

                      {/* Product Name & Details */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-snug flex items-center justify-between gap-1">
                          <span>{product.name}</span>
                        </h4>
                        <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1 flex items-center gap-1">
                          <HeartPulse className="w-3 h-3 text-slate-400 shrink-0" />
                          {product.genericName}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dosage & Pack:</span>
                          <span className="font-medium text-slate-800">{product.packSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">NAFDAC Reg No:</span>
                          <span className="font-mono font-bold text-slate-800">{product.nafdacRegNo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Shelf Stability:</span>
                          <span className="font-semibold text-emerald-800 text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            36 Months (Active)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Direct Factory Stock:</span>
                          <span className="font-semibold text-emerald-700">
                            {product.inventory.toLocaleString()} packs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Wholesale Price</span>
                        <span className="text-base font-bold font-mono text-slate-900">
                          {formatNaira(product.unitPrice)}
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1 shadow-xs min-h-[44px]">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, inCart.quantity - 10)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-[0.95] touch-target"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold px-2 text-slate-800 min-w-[28px] text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, inCart.quantity + 10)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded active:scale-[0.95] touch-target"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            addToCart(product, product.minOrderQuantity || 20);
                            toast.success(`Added ${product.minOrderQuantity || 20} packs to restock order`);
                          }}
                          className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs min-h-[44px] px-3.5 active:scale-[0.98] transition-all font-semibold touch-target shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add MOQ ({product.minOrderQuantity || 20})
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* SUB-VIEW 3: FINTECH & WORKING CAPITAL TRACKER */}
          <TabsContent value="fintech" className="space-y-6">
            {/* Credit Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md space-y-4">
                <div className="flex items-center justify-between text-emerald-300 text-xs">
                  <span className="font-bold uppercase tracking-wider">Total Credit Facility</span>
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-white">
                  {formatNaira(fintech.creditLimit)}
                </div>
                <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200">
                  <span>Financing Partner:</span>
                  <span className="font-semibold text-white">{fintech.financingPartner.split("&")[0]}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold uppercase tracking-wider">Available Restock Line</span>
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-800">
                  {formatNaira(fintech.availableBalance)}
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Credit Utilization:</span>
                    <span className="font-mono font-bold text-slate-800">{utilizationPct}%</span>
                  </div>
                  <Progress value={utilizationPct} className="h-1.5 bg-slate-100" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-bold uppercase tracking-wider">Active Drawn Balance</span>
                  <Receipt className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-900">
                  {formatNaira(fintech.drawnBalance)}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Rate: {fintech.interestRateMonthly}% / 30-day term</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCreditIncreaseOpen(true)}
                    className="text-xs text-emerald-800 hover:bg-emerald-50 h-7 px-2 font-semibold"
                  >
                    Request Limit Increase →
                  </Button>
                </div>
              </div>
            </div>

            {/* Invoices & Repayments Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Active Financing Invoices & Repayment Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Settle invoices to instantly restore your pharmacy’s working capital facility.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold text-emerald-800 border-emerald-300 self-start sm:self-auto">
                  {fintech.creditRating}
                </Badge>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Supplier / Manufacturer</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Issue Date</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Repayment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fintech.activeInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-800">
                          {inv.supplierName}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {formatNaira(inv.amount)}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {inv.issueDate}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">
                          {inv.dueDate}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              inv.status === "paid"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : inv.status === "active"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {inv.status === "active" ? (
                            <Button
                              size="sm"
                              onClick={() => setRepayModalInvoice(inv)}
                              className="bg-emerald-900 hover:bg-emerald-800 text-white text-xs min-h-[36px] px-3 active:scale-[0.98] font-semibold"
                            >
                              Repay Invoice
                            </Button>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (< 768px) */}
              <div className="md:hidden space-y-3">
                {fintech.activeInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNo}</span>
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : inv.status === "active"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">{inv.supplierName}</div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatNaira(inv.amount)}</span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1.5 border-t border-slate-200/60">
                      <span>Due: {inv.dueDate}</span>
                      <span>Issued: {inv.issueDate}</span>
                    </div>

                    {inv.status === "active" ? (
                      <Button
                        size="sm"
                        onClick={() => setRepayModalInvoice(inv)}
                        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white text-xs min-h-[44px] font-bold active:scale-[0.98] touch-target"
                      >
                        Authorize Repayment ({formatNaira(inv.amount)})
                      </Button>
                    ) : (
                      <div className="text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 py-1">
                        <CheckCircle2 className="w-4 h-4" /> Invoice Fully Settled
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* SUB-VIEW 4: ORDERS & DELIVERIES */}
          <TabsContent value="orders" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Direct Manufacturer Procurement Orders
                </h3>
                <p className="text-xs text-slate-500">
                  Chain-of-custody tracked consignments ordered directly from verified manufacturers.
                </p>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3.5 px-3">Order Number</th>
                      <th className="py-3.5 px-3">Manufacturer</th>
                      <th className="py-3.5 px-3">Items</th>
                      <th className="py-3.5 px-3">Total Amount</th>
                      <th className="py-3.5 px-3">Terms</th>
                      <th className="py-3.5 px-3">Order Status</th>
                      <th className="py-3.5 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-800">
                          {order.supplierName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {order.items.map((i) => `${i.productName} (${i.quantity})`).join(", ")}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {formatNaira(order.totalAmount)}
                        </td>
                        <td className="py-3.5 px-3 uppercase text-[10px] font-semibold text-slate-700">
                          {order.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (< 768px) */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</span>
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">{order.supplierName}</div>

                    <div className="text-xs text-slate-600">
                      {order.items.map((i) => `${i.productName} (${i.quantity})`).join(", ")}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        {order.paymentMethod.replace("_", " ")}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatNaira(order.totalAmount)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono text-right">
                      Placed: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cart & Checkout Modal */}
      <Dialog open={cartDrawerOpen} onOpenChange={setCartDrawerOpen}>
        <DialogContent className="max-w-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-800" />
              Verified B2B Restock Order Checkout
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Procuring directly from verified manufacturers under PCN license {session.licenseNumber}
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Your restock cart is currently empty. Browse the B2B catalog to add genuine stock.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{item.product.name}</h5>
                      <p className="text-[11px] text-slate-500">
                        {item.product.manufacturerName} • {formatNaira(item.product.unitPrice)}/pack
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 10)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-[0.98]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold px-1.5 text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 10)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-[0.98]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-slate-900 w-24 text-right">
                        {formatNaira(item.product.unitPrice * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Financing Options */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Order Value:</span>
                  <span className="font-mono text-base text-emerald-800">{formatNaira(cartSubtotal)}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Choose Settlement Terms:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod("bnpl_30")}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedPaymentMethod === "bnpl_30"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>30-Day BNPL Credit</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Available: {formatNaira(fintech.availableBalance)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod("prepaid")}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedPaymentMethod === "prepaid"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>Direct Corporate Wire</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Immediate bank transfer
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-2.5 active:scale-[0.98] transition-all shadow-sm"
                  >
                    Confirm & Dispatch Genuine Restock Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Repayment Modal */}
      {repayModalInvoice && (
        <Dialog open={!!repayModalInvoice} onOpenChange={() => setRepayModalInvoice(null)}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Settle BNPL Financing Invoice
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Invoice {repayModalInvoice.invoiceNo} • {repayModalInvoice.supplierName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Due:</span>
                  <span className="font-bold text-slate-900 text-sm">{formatNaira(repayModalInvoice.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span>{repayModalInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Route:</span>
                  <span>NIBSS Instant Pay / Sterling HealthPay</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Settling this invoice immediately frees up {formatNaira(repayModalInvoice.amount)} in your pharmacy’s working capital credit facility.
              </p>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRepayModalInvoice(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRepay}
                  className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]"
                >
                  Authorize Settlement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Credit Increase Request Modal */}
      <Dialog open={creditIncreaseOpen} onOpenChange={setCreditIncreaseOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-800" />
              Apply for Credit Limit Increase
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Current facility: {formatNaira(fintech.creditLimit)} • Prime Pharmacy Status
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreditIncreaseRequest} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Requested Additional Facility (₦):</label>
              <Input
                type="number"
                step="500000"
                value={requestedIncrease}
                onChange={(e) => setRequestedIncrease(e.target.value)}
                className="font-mono text-sm"
                required
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Automated underwriting evaluates your verified point-of-dispense scan volume and monthly inventory turnover on the PharmTrace ledger.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreditIncreaseOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold active:scale-[0.98]"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
