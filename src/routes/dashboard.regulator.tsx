import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useStore } from "@/lib/store";
import {
  type Batch,
  type RegulatoryIncident,
  formatNaira,
} from "@/lib/pharmtrace-data";
import {
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  Search,
  Building2,
  Truck,
  CheckCircle2,
  XCircle,
  FileWarning,
  Download,
  Filter,
  Eye,
  FileSpreadsheet,
  Ban,
  Radio,
  Printer,
  SlidersHorizontal,
  Pill,
  FlaskConical,
  Syringe,
  Cross,
  HeartPulse,
  QrCode,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/regulator")({
  component: RegulatorDashboard,
  head: () => ({
    meta: [
      { title: "Regulatory Auditor & NAFDAC Inspectorate | PharmTrace Systems" },
      {
        name: "description",
        content:
          "Chain of custody audit trail, suspect batch tracer, 48-hour error logs, and regulatory recall enforcement console.",
      },
    ],
  }),
});

function RegulatorDashboard() {
  const session = useStore((s) => s.session);
  const batches = useStore((s) => s.batches);
  const supplyEvents = useStore((s) => s.supplyEvents);
  const incidents = useStore((s) => s.incidents);
  const updateBatchState = useStore((s) => s.updateBatchState);
  const updateIncidentStatus = useStore((s) => s.updateIncidentStatus);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("All");
  const [selectedBatchState, setSelectedBatchState] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedBatchForInspection, setSelectedBatchForInspection] = useState<Batch | null>(null);
  const [quarantineModalBatch, setQuarantineModalBatch] = useState<Batch | null>(null);
  const [quarantineReason, setQuarantineReason] = useState("");
  const [actionType, setActionType] = useState<"quarantined" | "recalled">("quarantined");

  // Filter batches for suspect tracer
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gtin.includes(searchTerm) ||
      b.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedBatchState === "All" || b.state === selectedBatchState;
    const matchesLocation =
      selectedLocation === "All" || b.currentHolder.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesState && matchesLocation;
  });

  // Filter incidents for 48-hour queue
  const filteredIncidents = incidents.filter((inc) => {
    const matchesRisk = selectedRiskLevel === "All" || inc.severity === selectedRiskLevel;
    return matchesRisk;
  });

  const handleApplyEnforcement = () => {
    if (!quarantineModalBatch) return;

    updateBatchState(
      quarantineModalBatch.id,
      actionType,
      quarantineReason || `NAFDAC Enforcement Directive: Marked as ${actionType.toUpperCase()}`,
    );

    toast.success(`Regulatory Directive Dispatched: ${actionType.toUpperCase()}`, {
      description: `Batch ${quarantineModalBatch.batchNumber} has been marked as ${actionType} across all Nigeria pharmacy and hospital nodes.`,
    });

    setQuarantineModalBatch(null);
    setQuarantineReason("");
  };

  const handleExportAuditDossier = () => {
    const rows = [
      ["ReportID", "BatchNumber", "Product", "ReportedBy", "IncidentType", "Severity", "Status", "Date"],
      ...incidents.map((i) => [
        i.reportNumber,
        i.batchNumber,
        i.productName,
        `${i.reportedBy} (${i.reporterOrg})`,
        i.incidentType,
        i.severity,
        i.status,
        i.reportedAt,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NAFDAC_Audit_Dossier_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("NAFDAC Audit Dossier Exported");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8">
        {/* Regulator Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle medical molecular background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-molecular-dark opacity-30 pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <FileCheck2 className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  NAFDAC Post-Marketing Surveillance Directorate
                </h1>
                <Badge className="bg-emerald-800 text-emerald-200 border-emerald-600 text-xs">
                  OFFICIAL AUDITOR CONSOLE
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Authorized Inspector: <strong className="text-white">{session.name}</strong></span>
                <span>•</span>
                <span>National Trust Mesh Node: Lagos/Abuja (Active)</span>
              </p>

              {/* Regulatory Compliance Badges */}
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <Badge variant="outline" className="bg-emerald-950/80 text-emerald-300 border-emerald-600/50 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> NAFDAC Mandate Enforcement
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-emerald-400" /> GS1 Healthcare Registry Verified
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
                  48-Hr Alert Protocol
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleExportAuditDossier}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9 px-4 flex items-center gap-1.5 active:scale-[0.98] transition-all font-semibold"
            >
              <Download className="w-4 h-4" /> Export Inspection Dossier
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs h-9 px-3 active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 4 National Sentinel Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Total Tracked Batches</span>
              <Building2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {batches.length} Lots
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
              Active across 4 licensed plants
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">48-Hr Incident Reports</span>
              <FileWarning className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-red-600">
              {incidents.length} Logged
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {incidents.filter((i) => i.status === "investigating").length} Under Active Investigation
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Custody Handoff Events</span>
              <Truck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {supplyEvents.length} Events
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              EPCIS tamper-sealed records
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Active Recalls</span>
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-red-600">
              {batches.filter((b) => b.state === "recalled").length} Batches
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Nationwide lock active
            </div>
          </div>
        </div>

        {/* Tabbed Inspectorate Consoles */}
        <Tabs defaultValue="tracer" className="space-y-6">
          <TabsList className="bg-slate-200/80 p-1 rounded-xl">
            <TabsTrigger value="tracer" className="text-xs sm:text-sm font-semibold">
              <Search className="w-4 h-4 mr-1.5" /> Suspect Batch Tracer & Pedigree
            </TabsTrigger>
            <TabsTrigger value="incidents" className="text-xs sm:text-sm font-semibold">
              <FileWarning className="w-4 h-4 mr-1.5" /> 48-Hour Discrepancy & Alert Queue
            </TabsTrigger>
            <TabsTrigger value="custody-stream" className="text-xs sm:text-sm font-semibold">
              <Truck className="w-4 h-4 mr-1.5" /> National EPCIS Custody Stream
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SUSPECT BATCH TRACER */}
          <TabsContent value="tracer" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Trace by Batch / Lot Number, Serial, or GTIN..."
                    className="pl-9 text-xs sm:text-sm bg-slate-50 border-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* State Filter */}
                  <select
                    value={selectedBatchState}
                    onChange={(e) => setSelectedBatchState(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs text-slate-700 font-medium"
                  >
                    <option value="All">All States</option>
                    <option value="active">Active Only</option>
                    <option value="recalled">Recalled</option>
                    <option value="quarantined">Quarantined</option>
                  </select>

                  {/* Location Filter */}
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs text-slate-700 font-medium"
                  >
                    <option value="All">All Locations</option>
                    <option value="Lekki">Lekki (Medplus)</option>
                    <option value="Ikeja">Ikeja (HealthPlus/Emzor)</option>
                    <option value="Oshodi">Oshodi (Medsaf Logistics)</option>
                    <option value="Sagamu">Sagamu Disposal Facility</option>
                  </select>
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
                      <th className="py-3.5 px-3">Serial Prefix</th>
                      <th className="py-3.5 px-3">Current Location / Holder</th>
                      <th className="py-3.5 px-3">Regulatory State</th>
                      <th className="py-3.5 px-3 text-right">Enforcement Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <td className="py-3.5 px-3 font-mono text-slate-700 truncate max-w-[120px]">
                          {batch.serialNumber}
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
                            onClick={() => setSelectedBatchForInspection(batch)}
                            className="h-8 text-xs px-2.5 text-emerald-900 hover:bg-emerald-50 font-bold active:scale-[0.98]"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Inspect Pedigree
                          </Button>

                          {batch.state === "active" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setQuarantineModalBatch(batch);
                                  setActionType("quarantined");
                                }}
                                className="h-8 text-xs px-2.5 text-amber-700 border-amber-300 hover:bg-amber-50 active:scale-[0.98]"
                              >
                                Quarantine
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setQuarantineModalBatch(batch);
                                  setActionType("recalled");
                                }}
                                className="h-8 text-xs px-2.5 text-red-700 border-red-300 hover:bg-red-50 font-bold active:scale-[0.98]"
                              >
                                Recall
                              </Button>
                            </>
                          )}
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
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
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

                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                      <div>
                        <span className="text-slate-400">Current Node:</span>{" "}
                        <strong className="text-slate-800">{batch.currentHolder}</strong>
                      </div>
                      <div className="font-mono text-[11px]">
                        <span className="text-slate-400">Serial:</span> {batch.serialNumber}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBatchForInspection(batch)}
                        className="w-full min-h-[44px] text-xs font-bold text-emerald-950 border-emerald-300 hover:bg-emerald-50 active:scale-[0.98] touch-target"
                      >
                        <Eye className="w-4 h-4 mr-1.5 text-emerald-700" /> Inspect Full Pedigree
                      </Button>

                      {batch.state === "active" && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuarantineModalBatch(batch);
                              setActionType("quarantined");
                            }}
                            className="min-h-[44px] text-xs text-amber-700 border-amber-300 hover:bg-amber-50 active:scale-[0.98] touch-target"
                          >
                            Quarantine
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuarantineModalBatch(batch);
                              setActionType("recalled");
                            }}
                            className="min-h-[44px] text-xs text-red-700 border-red-300 hover:bg-red-50 font-bold active:scale-[0.98] touch-target"
                          >
                            Recall Lot
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: 48-HOUR DISCREPANCY QUEUE */}
          <TabsContent value="incidents" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    NAFDAC Mandatory 48-Hour Error & Counterfeit Alert Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incidents reported by licensed pharmacies, distributors, or inspectors requiring regulatory resolution.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedRiskLevel}
                    onChange={(e) => setSelectedRiskLevel(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-slate-50 text-slate-700 font-medium"
                  >
                    <option value="All">All Severities</option>
                    <option value="critical">Critical Severity</option>
                    <option value="high">High Severity</option>
                    <option value="medium">Medium</option>
                  </select>

                  <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-bold">
                    {filteredIncidents.length} Incident Queue
                  </Badge>
                </div>
              </div>

              {/* Desktop Table View (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3.5 px-3">Report ID</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-3">Product & Batch</th>
                      <th className="py-3.5 px-3">Reported By / Facility</th>
                      <th className="py-3.5 px-3">Severity</th>
                      <th className="py-3.5 px-3">Description</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3 text-right">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {inc.reportNumber}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 uppercase text-[10px]">
                          {inc.incidentType.replaceAll("_", " ")}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <Pill className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{inc.productName}</span>
                          </div>
                          <div className="font-mono text-slate-500 text-[10px]">{inc.batchNumber}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <div className="font-medium text-slate-800">{inc.reportedBy}</div>
                          <div className="text-[10px] text-slate-400">{inc.reporterOrg}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            className={`text-[10px] uppercase font-bold ${
                              inc.severity === "critical"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {inc.severity}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 max-w-xs text-[11px] leading-tight">
                          {inc.description}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-700">
                            {inc.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {inc.status !== "resolved" ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                updateIncidentStatus(
                                  inc.id,
                                  "resolved",
                                  "Site inspection completed by NAFDAC Lagos taskforce. Sample assays verified.",
                                );
                                toast.success("Incident Marked Resolved");
                              }}
                              className="bg-emerald-900 hover:bg-emerald-800 text-white text-[11px] h-8 px-3 active:scale-[0.98] font-semibold"
                            >
                              Resolve
                            </Button>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
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
                {filteredIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{inc.reportNumber}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={`text-[10px] uppercase font-bold ${
                            inc.severity === "critical"
                              ? "bg-red-100 text-red-800 border-red-300 animate-pulse"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {inc.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-700">
                          {inc.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-700 shrink-0" />
                        {inc.productName}
                      </h4>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Batch: <span className="font-bold text-slate-800">{inc.batchNumber}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                      "{inc.description}"
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Reported by: {inc.reportedBy}</span>
                      <span className="font-mono text-slate-400">{inc.reporterOrg}</span>
                    </div>

                    {inc.status !== "resolved" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateIncidentStatus(
                            inc.id,
                            "resolved",
                            "Site inspection completed by NAFDAC taskforce. Sample assays verified.",
                          );
                          toast.success("Incident Marked Resolved");
                        }}
                        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white text-xs min-h-[44px] font-bold active:scale-[0.98] touch-target"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" />
                        Authorize Resolution & Close
                      </Button>
                    ) : (
                      <div className="text-emerald-700 font-semibold text-xs flex items-center justify-center gap-1.5 py-1">
                        <CheckCircle2 className="w-4 h-4" /> Incident Resolved & Archived
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: NATIONAL EPCIS CUSTODY STREAM */}
          <TabsContent value="custody-stream" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Live National EPCIS Supply Chain Event Log
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable chronological audit trail of all drug manufacturing, packing, dispatch, and receiving events in Nigeria.
                </p>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {supplyEvents.map((ev) => (
                  <div key={ev.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 capitalize text-sm">
                            {ev.eventType} Event
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono text-emerald-800 border-emerald-300 font-bold">
                            {ev.batchNumber}
                          </Badge>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(ev.occurredAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-800 font-semibold">
                        Product: {ev.productName}
                      </div>

                      <div className="text-slate-600">
                        Facility / Location: <strong className="text-slate-900">{ev.location}</strong>
                      </div>

                      <div className="text-slate-500 italic text-[11px]">
                        "{ev.notes}"
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                        <span>Signed by: {ev.performedBy}</span>
                        <span>Tamper Seal: {ev.tamperSealIntact ? "INTACT" : "BREACHED"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Inspect Pedigree Modal */}
      {selectedBatchForInspection && (
        <Dialog open={!!selectedBatchForInspection} onOpenChange={() => setSelectedBatchForInspection(null)}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Complete Chain-of-Custody Pedigree
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Batch {selectedBatchForInspection.batchNumber} • {selectedBatchForInspection.productName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">GTIN:</span>
                  <span className="font-bold text-slate-800">{selectedBatchForInspection.gtin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">EXPIRY:</span>
                  <span className="font-bold text-slate-800">{selectedBatchForInspection.expiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">COMMISSIONED:</span>
                  <span className="font-bold text-slate-800">{selectedBatchForInspection.unitsCommissioned.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">REMAINING:</span>
                  <span className="font-bold text-slate-800">{selectedBatchForInspection.unitsRemaining.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 text-xs mb-2">Custody Handoff History:</h5>
                <div className="space-y-2">
                  {supplyEvents
                    .filter((e) => e.batchId === selectedBatchForInspection.id)
                    .map((ev, i) => (
                      <div key={ev.id || i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="capitalize">{ev.eventType}</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(ev.occurredAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-slate-600">{ev.location}</div>
                        <div className="text-slate-500 italic text-[11px]">"{ev.notes}"</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setSelectedBatchForInspection(null)}
                  className="bg-slate-900 text-white text-xs px-6 active:scale-[0.98]"
                >
                  Close Audit Dossier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quarantine / Recall Modal */}
      {quarantineModalBatch && (
        <Dialog open={!!quarantineModalBatch} onOpenChange={() => setQuarantineModalBatch(null)}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5" />
                Issue Emergency {actionType.toUpperCase()} Directive
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Batch {quarantineModalBatch.batchNumber} ({quarantineModalBatch.productName})
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed font-medium">
                Issuing this directive will immediately lock the batch on the national GS1 ledger. Any pharmacy scanning this pack will receive a prominent crimson alert blocking dispensing.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Regulatory Justification / Failure Reason:
                </label>
                <Input
                  value={quarantineReason}
                  onChange={(e) => setQuarantineReason(e.target.value)}
                  placeholder="e.g. Sub-potent assay failure (NAFDAC Recall Notice 088)"
                  className="text-xs border-slate-300"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setQuarantineModalBatch(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyEnforcement}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold active:scale-[0.98]"
                >
                  Confirm & Broadcast Recall
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
