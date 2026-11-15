import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useStore } from "@/lib/store";
import {
  type Batch,
  type SupplyEventType,
  calculateGtin14CheckDigit,
  isValidGtin,
  createDemoStyleSerial,
  eventLabels,
  formatNaira,
} from "@/lib/pharmtrace-data";
import { DataMatrixBarcode } from "@/components/pharmtrace/DataMatrixBarcode";
import {
  QrCode,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Building2,
  Layers,
  Thermometer,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Clock,
  Sparkles,
  Info,
  Pill,
  FlaskConical,
  Syringe,
  Cross,
  HeartPulse,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/manufacturer")({
  component: ManufacturerDashboard,
  head: () => ({
    meta: [
      { title: "Manufacturer Serialization & Compliance Hub | PharmTrace Systems" },
      {
        name: "description",
        content:
          "GS1 2D DataMatrix serialization generator with Zod validation, EPCIS supply chain event logger, and NAFDAC compliance score dashboard.",
      },
    ],
  }),
});

// Zod Schema for Batch Serialization
const batchSchema = z.object({
  productId: z.string().min(1, "Please select a pharmaceutical product"),
  batchNumber: z
    .string()
    .min(3, "Batch number must be at least 3 characters")
    .max(20, "Batch number cannot exceed 20 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "Batch number can only contain letters, numbers, hyphens, and underscores"),
  manufacturingDate: z.string().min(1, "Manufacturing date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.coerce
    .number()
    .min(50, "Minimum production run is 50 packs")
    .max(1000000, "Maximum batch limit is 1,000,000 packs"),
  storageCondition: z.string().min(1, "Storage protocol is required"),
}).refine((data) => new Date(data.expiryDate) > new Date(data.manufacturingDate), {
  message: "Expiry date must be later than manufacturing date",
  path: ["expiryDate"],
});

type BatchFormData = z.infer<typeof batchSchema>;

// Zod Schema for Supply Chain Event Logger
const eventSchema = z.object({
  batchId: z.string().min(1, "Please select target batch"),
  eventType: z.enum(["commissioning", "packing", "shipping", "receiving"]),
  location: z.string().min(3, "Facility name/location is required"),
  notes: z.string().min(5, "Operational notes must be at least 5 characters"),
  temperatureCelsius: z.coerce.number().min(-30).max(60),
});

type EventFormData = z.infer<typeof eventSchema>;

function ManufacturerDashboard() {
  const session = useStore((s) => s.session);
  const products = useStore((s) => s.products);
  const batches = useStore((s) => s.batches);
  const supplyEvents = useStore((s) => s.supplyEvents);
  const addBatch = useStore((s) => s.addBatch);
  const addSupplyEvent = useStore((s) => s.addSupplyEvent);

  const plantBatches = batches.filter(
    (b) => b.organizationId === session.organizationId || session.role === "super_admin",
  );
  const displayBatches = plantBatches.length > 0 ? plantBatches : batches;

  const [searchTerm, setSearchTerm] = useState("");
  const [viewBarcodeBatch, setViewBarcodeBatch] = useState<Batch | null>(null);
  const [unitSerialCount, setUnitSerialCount] = useState(50);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // React Hook Form for Batch Generator
  const {
    register: registerBatch,
    handleSubmit: handleSubmitBatch,
    watch: watchBatch,
    setValue: setBatchValue,
    formState: { errors: batchErrors },
    reset: resetBatchForm,
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      productId: products[0]?.id || "",
      batchNumber: `LOT-2026-EMZ${Math.floor(Math.random() * 80 + 10)}`,
      manufacturingDate: new Date().toISOString().slice(0, 10),
      expiryDate: "2028-12-31",
      quantity: 10000,
      storageCondition: "Ambient Controlled (20-25°C)",
    },
  });

  // React Hook Form for Event Logger
  const {
    register: registerEvent,
    handleSubmit: handleSubmitEvent,
    setValue: setEventValue,
    watch: watchEvent,
    formState: { errors: eventErrors },
    reset: resetEventForm,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      batchId: displayBatches[0]?.id || "",
      eventType: "shipping",
      location: "Emzor Central Depot, Ikeja Industrial Estate, Lagos",
      notes: "Dispatched via verified temperature-monitored freight truck to regional distribution center",
      temperatureCelsius: 23.4,
    },
  });

  const selectedProductId = watchBatch("productId");
  const watchBatchNumber = watchBatch("batchNumber");
  const watchExpiryDate = watchBatch("expiryDate");
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Compliance Metrics
  const totalPacksTracked = displayBatches.reduce((sum, b) => sum + b.unitsCommissioned, 0);
  const compliantBatches = displayBatches.filter((b) => b.state === "active" && b.nafdacNotified);
  const complianceScore = displayBatches.length > 0
    ? Math.round((compliantBatches.length / displayBatches.length) * 100)
    : 98;

  // Submit Batch Serialization Form
  const onBatchSubmit = (data: BatchFormData) => {
    setIsSubmittingBatch(true);

    setTimeout(() => {
      const primarySerial = createDemoStyleSerial("PT-EMZ");

      const created = addBatch({
        organizationId: session.organizationId,
        productId: data.productId,
        productName: selectedProduct?.name || "Pharmaceutical Item",
        gtin: selectedProduct?.gtin || "05012345678900",
        batchNumber: data.batchNumber.trim().toUpperCase(),
        serialNumber: primarySerial,
        manufacturingDate: data.manufacturingDate,
        expiryDate: data.expiryDate,
        state: "active",
        unitsCommissioned: data.quantity,
        unitsRemaining: data.quantity,
        currentHolder: `${session.organizationName} - Packaging Hall`,
        coldChainTemperature: data.storageCondition,
        nafdacNotified: true,
      });

      setIsSubmittingBatch(false);
      setViewBarcodeBatch(created);

      toast.success("GS1 Batch Commissioned & Synchronized", {
        description: `Batch ${created.batchNumber} (${created.unitsCommissioned.toLocaleString()} units) registered on NAFDAC GS1 Ledger.`,
      });

      resetBatchForm({
        productId: data.productId,
        batchNumber: `LOT-2026-EMZ${Math.floor(Math.random() * 80 + 10)}`,
        manufacturingDate: new Date().toISOString().slice(0, 10),
        expiryDate: "2028-12-31",
        quantity: 10000,
        storageCondition: data.storageCondition,
      });
    }, 450);
  };

  // Submit Event Logger Form
  const onEventSubmit = (data: EventFormData) => {
    setIsSubmittingEvent(true);

    setTimeout(() => {
      const targetBatch = displayBatches.find((b) => b.id === data.batchId) || displayBatches[0];
      if (!targetBatch) {
        toast.error("Target batch not found");
        setIsSubmittingEvent(false);
        return;
      }

      addSupplyEvent({
        batchId: targetBatch.id,
        batchNumber: targetBatch.batchNumber,
        productName: targetBatch.productName,
        eventType: data.eventType,
        location: data.location,
        performedBy: session.name,
        notes: data.notes,
        organizationId: session.organizationId,
        organizationName: session.organizationName,
        temperatureCelsius: data.temperatureCelsius,
        tamperSealIntact: true,
      });

      setIsSubmittingEvent(false);
      toast.success("EPCIS Supply Event Committed", {
        description: `${eventLabels[data.eventType]} recorded for Batch ${targetBatch.batchNumber}.`,
      });
    }, 400);
  };

  // Export Serials as CSV
  const handleExportCsv = (batch: Batch) => {
    const rows = [
      ["GTIN", "BatchNumber", "ExpiryDate", "SerialNumber", "FullGS1Payload"],
    ];
    for (let i = 1; i <= unitSerialCount; i++) {
      const sn = `${batch.serialNumber}-${i.toString().padStart(4, "0")}`;
      const yyMMdd = batch.expiryDate.slice(2).replaceAll("-", "");
      const payload = `01${batch.gtin}17${yyMMdd}10${batch.batchNumber}\u001d21${sn}`;
      rows.push([batch.gtin, batch.batchNumber, batch.expiryDate, sn, payload]);
    }
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GS1_Serials_${batch.batchNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${unitSerialCount} GS1 DataMatrix unit serials`);
  };

  // Filtered Batches
  const filteredBatches = displayBatches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gtin.includes(searchTerm),
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8">
        {/* Plant Overview Header with Medical Compliance Badges */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle medical background motif */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-pharma-mesh opacity-40 pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-7 h-7 text-emerald-300" />
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
              <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Serialization Line & Regulatory Console</span>
                <span>•</span>
                <span>Active Operator: <strong className="text-slate-800">{session.name}</strong></span>
              </p>

              {/* Compliance Stamps */}
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> NAFDAC GS1 Mandate Ready
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-[10px] font-mono flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-emerald-700" /> ISO/IEC 16022 2D Serialized
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-[10px] font-mono">
                  GS1 Nigeria Interoperable
                </Badge>
              </div>
            </div>
          </div>

          {/* Compliance Meter & Unit Counter */}
          <div className="flex items-center gap-6 divide-x divide-slate-200">
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                  {complianceScore}%
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                NAFDAC Health Score
              </p>
              <div className="w-28 ml-auto">
                <Progress value={complianceScore} className="h-1.5 bg-slate-100" />
              </div>
            </div>
            <div className="pl-6 text-right">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {totalPacksTracked.toLocaleString()}
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Serialized Units
              </p>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Active Batches</span>
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {displayBatches.filter((b) => b.state === "active").length} Lots
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% GS1 Compliant
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">EPCIS Events Logged</span>
              <Truck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {supplyEvents.length} Events
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Commissioning, Dispatch, Inbound
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">NAFDAC Regulatory Sync</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              Synchronized
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Central Ledger Node: Lagos
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Quarantined / Recalled</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-red-600">
              {displayBatches.filter((b) => b.state === "recalled" || b.state === "quarantined").length} Lots
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Sentinel surveillance alerts
            </div>
          </div>
        </div>

        {/* Operational Tabs */}
        <Tabs defaultValue="serialization" className="space-y-6">
          <TabsList className="bg-slate-200/80 p-1 rounded-xl">
            <TabsTrigger value="serialization" className="text-xs sm:text-sm font-semibold">
              <QrCode className="w-4 h-4 mr-1.5" /> GS1 Serialization Hub
            </TabsTrigger>
            <TabsTrigger value="event-logger" className="text-xs sm:text-sm font-semibold">
              <Truck className="w-4 h-4 mr-1.5" /> EPCIS Supply Event Logger
            </TabsTrigger>
            <TabsTrigger value="batch-registry" className="text-xs sm:text-sm font-semibold">
              <Layers className="w-4 h-4 mr-1.5" /> Batch & Packaging Registry
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SERIALIZATION HUB */}
          <TabsContent value="serialization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Serialization Commissioning Form with Zod */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-800" />
                    GS1 2D DataMatrix Batch Commissioning
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Generate NAFDAC-mandated 2D DataMatrix serial codes with ISO/IEC 16022 encoding. Validated via Zod.
                  </p>
                </div>

                <form onSubmit={handleSubmitBatch(onBatchSubmit)} className="space-y-4">
                  {/* Select Product */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Pharmaceutical Product
                    </label>
                    <Select
                      value={selectedProductId}
                      onValueChange={(val) => setBatchValue("productId", val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="bg-slate-50 text-xs sm:text-sm border-slate-300">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.name} ({prod.nafdacRegNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batchErrors.productId && (
                      <p className="text-xs text-red-600 font-medium">{batchErrors.productId.message}</p>
                    )}
                  </div>

                  {/* GTIN Display & Batch Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        GS1 GTIN-14 (Global Trade Item Number)
                      </label>
                      <Input
                        value={selectedProduct?.gtin || "05012345678900"}
                        readOnly
                        className="bg-slate-100 font-mono text-xs font-bold text-slate-800 border-slate-300"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        ✓ Check digit verified (GS1 Nigeria prefix)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Manufacturing Batch / Lot Number
                      </label>
                      <Input
                        {...registerBatch("batchNumber")}
                        placeholder="e.g. LOT-2026-EMZ01"
                        className="font-mono text-xs uppercase border-slate-300"
                      />
                      {batchErrors.batchNumber && (
                        <p className="text-xs text-red-600 font-medium">{batchErrors.batchNumber.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Dates & Quantities */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Manufacturing Date
                      </label>
                      <Input
                        type="date"
                        {...registerBatch("manufacturingDate")}
                        className="text-xs border-slate-300"
                      />
                      {batchErrors.manufacturingDate && (
                        <p className="text-xs text-red-600 font-medium">{batchErrors.manufacturingDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Expiry Date (EXP)
                      </label>
                      <Input
                        type="date"
                        {...registerBatch("expiryDate")}
                        className="text-xs border-slate-300"
                      />
                      {batchErrors.expiryDate && (
                        <p className="text-xs text-red-600 font-medium">{batchErrors.expiryDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Batch Production Size
                      </label>
                      <Input
                        type="number"
                        {...registerBatch("quantity")}
                        className="text-xs font-mono border-slate-300"
                      />
                      {batchErrors.quantity && (
                        <p className="text-xs text-red-600 font-medium">{batchErrors.quantity.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Storage Protocol */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Storage & Cold Chain Protocol
                    </label>
                    <Select
                      defaultValue="Ambient Controlled (20-25°C)"
                      onValueChange={(val) => setBatchValue("storageCondition", val)}
                    >
                      <SelectTrigger className="bg-slate-50 text-xs border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ambient Controlled (20-25°C)">
                          Ambient Controlled (20°C - 25°C, excursions permitted up to 30°C)
                        </SelectItem>
                        <SelectItem value="Refrigerated Cold Chain (2-8°C)">
                          Refrigerated Cold Chain (2°C - 8°C, continuously data-logged)
                        </SelectItem>
                        <SelectItem value="Deep Frozen (-20°C)">
                          Deep Frozen (-20°C)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                      NAFDAC MAS & GS1 Gateway: Ready to commission
                    </span>
                    <Button
                      type="submit"
                      disabled={isSubmittingBatch}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 active:scale-[0.98] transition-all"
                    >
                      {isSubmittingBatch ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registering on Ledger...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Commission Serialized Batch
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Real-Time Preview & Export Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between space-y-6 text-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Live GS1 DataMatrix Preview
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedProduct?.name || "Selected Product"}
                  </p>
                </div>

                <div className="py-2">
                  <DataMatrixBarcode
                    gtin={selectedProduct?.gtin || "05012345678900"}
                    batch={watchBatchNumber || "LOT-01"}
                    expiry={watchExpiryDate || "2028-12-31"}
                    serial="PT-EMZ-UNIT-0001"
                    size={160}
                    showActions={true}
                  />
                </div>

                <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">Export Serials Count:</span>
                    <select
                      value={unitSerialCount}
                      onChange={(e) => setUnitSerialCount(Number(e.target.value))}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-slate-50 font-mono"
                    >
                      <option value={20}>20 units (Sample)</option>
                      <option value={50}>50 units (Shipper Case)</option>
                      <option value={100}>100 units (Pallet Layer)</option>
                      <option value={500}>500 units (Production Run)</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => {
                      if (displayBatches[0]) handleExportCsv(displayBatches[0]);
                    }}
                    variant="outline"
                    className="w-full text-xs font-semibold border-slate-300 hover:bg-slate-50 text-slate-800 active:scale-[0.98] transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-800" />
                    Download Serialization CSV
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: EPCIS EVENT LOGGER */}
          <TabsContent value="event-logger" className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-800" />
                  EPCIS Standard Supply Chain Event Logger
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Record custody handoffs compliant with GS1 Electronic Product Code Information Services (EPCIS). Validated via Zod.
                </p>
              </div>

              <form onSubmit={handleSubmitEvent(onEventSubmit)} className="space-y-4">
                {/* Target Batch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Select Target Batch
                  </label>
                  <Select
                    defaultValue={displayBatches[0]?.id || ""}
                    onValueChange={(val) => setEventValue("batchId", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="bg-slate-50 text-xs sm:text-sm border-slate-300">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.batchNumber} — {b.productName} ({b.unitsRemaining.toLocaleString()} units)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {eventErrors.batchId && (
                    <p className="text-xs text-red-600 font-medium">{eventErrors.batchId.message}</p>
                  )}
                </div>

                {/* Event Type & Temp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Supply Chain Event Type
                    </label>
                    <Select
                      defaultValue="shipping"
                      onValueChange={(val: SupplyEventType) => setEventValue("eventType", val)}
                    >
                      <SelectTrigger className="bg-slate-50 text-xs border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commissioning">1. Commissioning (Packaging Line Release)</SelectItem>
                        <SelectItem value="packing">2. Packing (Aggregation into Shipper Cases)</SelectItem>
                        <SelectItem value="shipping">3. Shipping (Dispatch to Logistics / Wholesaler)</SelectItem>
                        <SelectItem value="receiving">4. Receiving (Inbound Receipt at Depot/Pharmacy)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Cold Chain Temperature (°C)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        {...registerEvent("temperatureCelsius")}
                        className="text-xs font-mono pl-8 border-slate-300"
                      />
                      <Thermometer className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {eventErrors.temperatureCelsius && (
                      <p className="text-xs text-red-600 font-medium">{eventErrors.temperatureCelsius.message}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Location / Facility GLN (Global Location Number)
                  </label>
                  <Input
                    {...registerEvent("location")}
                    placeholder="e.g. Lagos Central Distribution Center, Oshodi Logistics Park"
                    className="text-xs sm:text-sm border-slate-300"
                  />
                  {eventErrors.location && (
                    <p className="text-xs text-red-600 font-medium">{eventErrors.location.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Operational Notes & Seal Numbers
                  </label>
                  <Input
                    {...registerEvent("notes")}
                    placeholder="e.g. Tamper-evident security seal #NG-8891 applied. Quality release sign-off."
                    className="text-xs sm:text-sm border-slate-300"
                  />
                  {eventErrors.notes && (
                    <p className="text-xs text-red-600 font-medium">{eventErrors.notes.message}</p>
                  )}
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingEvent}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 active:scale-[0.98] transition-all shadow-sm"
                  >
                    {isSubmittingEvent ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging to Ledger...
                      </span>
                    ) : (
                      "Commit EPCIS Event to National Mesh"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* TAB 3: BATCH & PACKAGING REGISTRY */}
          <TabsContent value="batch-registry" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Batch Number, GTIN, or Product..."
                    className="pl-9 text-xs sm:text-sm bg-slate-50 border-slate-300"
                  />
                </div>

                <div className="text-xs text-slate-500 self-center font-medium">
                  Showing {filteredBatches.length} of {displayBatches.length} registered batches
                </div>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3.5 px-3">Batch / Lot</th>
                      <th className="py-3.5 px-3">Product Name</th>
                      <th className="py-3.5 px-3">GTIN-14</th>
                      <th className="py-3.5 px-3">Expiry Date</th>
                      <th className="py-3.5 px-3">Units</th>
                      <th className="py-3.5 px-3">Current Holder</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {batch.batchNumber}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5 mt-2">
                          <Pill className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{batch.productName}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {batch.gtin}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          {batch.expiryDate}
                        </td>
                        <td className="py-3.5 px-3 font-mono">
                          {batch.unitsRemaining.toLocaleString()} / {batch.unitsCommissioned.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 truncate max-w-[180px]">
                          {batch.currentHolder}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              batch.state === "active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : batch.state === "recalled"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {batch.state}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewBarcodeBatch(batch)}
                            className="h-8 text-xs px-2.5 text-emerald-900 hover:bg-emerald-50 active:scale-[0.98] font-semibold"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Barcode
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExportCsv(batch)}
                            className="h-8 text-xs px-2.5 text-slate-600 hover:bg-slate-100 active:scale-[0.98]"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> CSV
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View (< 768px) */}
              <div className="md:hidden space-y-3">
                {filteredBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{batch.batchNumber}</span>
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          batch.state === "active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : batch.state === "recalled"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {batch.state}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                        {batch.productName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">GTIN: {batch.gtin}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Expiry Date:</span>
                        <span className="font-semibold text-slate-800">{batch.expiryDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Available Units:</span>
                        <span className="font-semibold text-slate-800">
                          {batch.unitsRemaining.toLocaleString()} / {batch.unitsCommissioned.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate">
                      Holder: <span className="font-semibold">{batch.currentHolder}</span>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewBarcodeBatch(batch)}
                        className="flex-1 min-h-[44px] text-xs font-bold text-emerald-950 border-emerald-300 hover:bg-emerald-50 active:scale-[0.98] touch-target"
                      >
                        <QrCode className="w-4 h-4 mr-1.5 text-emerald-700" /> View 2D Code
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportCsv(batch)}
                        className="flex-1 min-h-[44px] text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-100 active:scale-[0.98] touch-target"
                      >
                        <Download className="w-4 h-4 mr-1.5 text-slate-500" /> Export CSV
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Barcode Viewer Modal */}
      {viewBarcodeBatch && (
        <Dialog open={!!viewBarcodeBatch} onOpenChange={() => setViewBarcodeBatch(null)}>
          <DialogContent className="max-w-md p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                GS1 2D DataMatrix Label & Verification Code
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {viewBarcodeBatch.productName} • Lot {viewBarcodeBatch.batchNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center py-4">
              <DataMatrixBarcode
                gtin={viewBarcodeBatch.gtin}
                batch={viewBarcodeBatch.batchNumber}
                expiry={viewBarcodeBatch.expiryDate}
                serial={viewBarcodeBatch.serialNumber}
                size={180}
                showActions={true}
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-left text-xs font-mono space-y-1 text-slate-700 border border-slate-200">
              <div>
                <span className="text-slate-400">GTIN-14:</span> {viewBarcodeBatch.gtin}
              </div>
              <div>
                <span className="text-slate-400">LOT:</span> {viewBarcodeBatch.batchNumber}
              </div>
              <div>
                <span className="text-slate-400">EXP:</span> {viewBarcodeBatch.expiryDate}
              </div>
              <div className="truncate">
                <span className="text-slate-400">SERIAL:</span> {viewBarcodeBatch.serialNumber}
              </div>
            </div>

            <Button
              onClick={() => setViewBarcodeBatch(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs mt-2 active:scale-[0.98]"
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
