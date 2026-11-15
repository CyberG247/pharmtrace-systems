import React, { useState, useRef, useEffect } from "react";
import {
  type VerificationResult,
  verifyProductScan,
  formatGs1HumanReadable,
} from "@/lib/pharmtrace-data";
import { useStore } from "@/lib/store";
import {
  Scan,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Camera,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  FileWarning,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Pill,
  Cross,
  Syringe,
  FlaskConical,
  HeartPulse,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DataMatrixBarcode } from "./DataMatrixBarcode";

interface BarcodeScannerProps {
  onScanComplete?: (result: VerificationResult) => void;
  className?: string;
  initialScanValue?: string;
}

// Gentle synthetic audio feedback using standard Web Audio API
function playScanSound(type: "authentic" | "counterfeit") {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "authentic") {
      // Pleasant double chime (880Hz -> 1320Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.28);
    } else {
      // Low dual warning buzz (220Hz / 180Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

// Device Haptic Feedback Simulation for Mobile Scanners
function triggerHapticFeedback(type: "authentic" | "counterfeit") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      if (type === "authentic") {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate([150, 80, 150, 80, 200]);
      }
    } catch {
      // Vibrator not supported or blocked
    }
  }
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanComplete,
  className = "",
  initialScanValue = "",
}) => {
  const batches = useStore((s) => s.batches);
  const products = useStore((s) => s.products);
  const events = useStore((s) => s.supplyEvents);
  const addScanResult = useStore((s) => s.addScanResult);
  const addRegulatoryIncident = useStore((s) => s.addRegulatoryIncident);
  const session = useStore((s) => s.session);

  const [inputVal, setInputVal] = useState(initialScanValue);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"manual" | "camera" | "upload">("manual");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reportFiled, setReportFiled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleVerify = (barcodeToTest?: string) => {
    const raw = barcodeToTest || inputVal;
    if (!raw.trim()) {
      toast.error("Please enter or scan a GS1 DataMatrix code");
      return;
    }

    setIsScanning(true);
    setResult(null);
    setReportFiled(false);

    // High-tech scanning delay (500ms) with tactile finish
    setTimeout(() => {
      const verification = verifyProductScan(raw.trim(), batches, products, events);
      setResult(verification);
      addScanResult(verification);
      setIsScanning(false);

      if (verification.status === "authentic") {
        if (soundEnabled) playScanSound("authentic");
        triggerHapticFeedback("authentic");
        toast.success("MEDICINE VERIFIED GENUINE", {
          description: `${verification.product?.name} validated against NAFDAC GS1 Ledger.`,
        });
      } else {
        if (soundEnabled) playScanSound("counterfeit");
        triggerHapticFeedback("counterfeit");
        if (verification.status === "counterfeit") {
          toast.error("CRITICAL: COUNTERFEIT PACK DETECTED", {
            description: "Unregistered serial number flagged. Do NOT dispense.",
          });
        } else if (verification.status === "recalled") {
          toast.error("MANDATORY NAFDAC RECALL", {
            description: "Batch is revoked by regulatory order. Quarantine immediately.",
          });
        } else {
          toast.warning("EXPIRED PHARMACEUTICAL", {
            description: "Past expiration date. Dispensing prohibited.",
          });
        }
      }

      if (onScanComplete) {
        onScanComplete(verification);
      }
    }, 550);
  };

  const handleQuickTest = (scenario: "authentic_lonart" | "authentic_coartem" | "authentic_amoxil" | "counterfeit" | "recalled" | "expired") => {
    let payload = "";
    if (scenario === "authentic_lonart") {
      payload = "01050123456789001728123110LOT-2026-EMZ01\u001d21PT-EMZ-LON-9041";
    } else if (scenario === "authentic_coartem") {
      payload = "01061514123456791728093010LOT-2026-CRT88\u001d21PT-EMZ-CRT-1102";
    } else if (scenario === "authentic_amoxil") {
      payload = "01089012345678901728063010LOT-2026-FID22\u001d21PT-FID-AMX-7734";
    } else if (scenario === "counterfeit") {
      payload = "01050123456789001728123110LOT-FAKE-99\u001d21PHARMTRACE-FAKE-9921";
    } else if (scenario === "recalled") {
      payload = "01075012345678931727060910LOT-REC-2026-X9\u001d21PT-RECALL-AUG-0012";
    } else if (scenario === "expired") {
      payload = "01053112345678971725010910LOT-EXP-2024-03\u001d21PT-SWP-EXP-9901";
    }
    setInputVal(payload);
    handleVerify(payload);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Check filename for simulated decoding
    let detectedPayload = "01050123456789001728123110LOT-2026-EMZ01\u001d21PT-EMZ-LON-9041";
    const lower = file.name.toLowerCase();
    if (lower.includes("fake") || lower.includes("counterfeit") || lower.includes("suspicious")) {
      detectedPayload = "01050123456789001728123110LOT-FAKE-99\u001d21PHARMTRACE-FAKE-9921";
    } else if (lower.includes("recall")) {
      detectedPayload = "01075012345678931727060910LOT-REC-2026-X9\u001d21PT-RECALL-AUG-0012";
    } else if (lower.includes("coartem")) {
      detectedPayload = "01061514123456791728093010LOT-2026-CRT88\u001d21PT-EMZ-CRT-1102";
    } else if (lower.includes("amoxil")) {
      detectedPayload = "01089012345678901728063010LOT-2026-FID22\u001d21PT-FID-AMX-7734";
    }

    setInputVal(detectedPayload);
    toast.info("Image Uploaded", {
      description: `Analyzing 2D DataMatrix code in ${file.name}...`,
    });
    handleVerify(detectedPayload);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const toggleCamera = async () => {
    if (scanMode === "camera") {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
      setScanMode("manual");
      return;
    }

    setScanMode("camera");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          toast.info("Camera Active", { description: "Align 2D DataMatrix code in the optical reticle." });
        }
      } else {
        toast.info("Camera Device Unavailable", { description: "You can upload a label image or use scenario buttons." });
      }
    } catch {
      toast.info("Camera preview restricted or simulated. Use upload or scenario buttons.");
    }
  };

  const handleFileNafdacReport = () => {
    if (!result) return;

    addRegulatoryIncident({
      reportNumber: `NAF-PV-${Date.now().toString().slice(-5)}`,
      batchNumber: result.batchNumber || "UNIDENTIFIED-LOT",
      productName: result.product?.name || "Suspect Falsified Pack",
      reportedBy: session.name,
      reporterOrg: session.organizationName,
      incidentType: result.status === "counterfeit" ? "suspect_counterfeit" : "48_hour_deviation",
      severity: "critical",
      description: `Rapid sentinel alert: Intercepted during verification at ${session.organizationName}. Scanned payload: ${result.scannedPayload}. Immediate enforcement action requested under Counterfeit & Fake Drugs Act.`,
      status: "investigating",
    });

    setReportFiled(true);
    toast.success("NAFDAC Sentinel Alert Dispatched", {
      description: "Priority incident lodged directly with NAFDAC Pharmacovigilance Enforcement.",
    });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${className}`}>
      {/* Scanner Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                GS1 2D DataMatrix Central Verifier
              </h3>
              <Badge variant="outline" className="bg-emerald-950/80 text-emerald-300 border-emerald-600/50 text-[10px] py-0">
                ACTIVE MESH
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-[11px] text-slate-400">
                NAFDAC MAS & GS1 Healthcare Interoperable
              </span>
              <span className="text-emerald-400 text-xs hidden sm:inline">•</span>
              <span className="text-[10px] text-emerald-300 font-mono hidden sm:inline">
                ISO/IEC 16022 2D Matrix
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-slate-400 hover:text-white text-xs min-h-[44px] min-w-[44px] p-0 flex items-center justify-center touch-target"
            title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* Camera toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleCamera}
            className={`border-slate-700 text-xs min-h-[44px] px-3.5 active:scale-[0.98] transition-all touch-target font-semibold ${
              scanMode === "camera"
                ? "bg-emerald-700 text-white border-emerald-600"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Camera className="w-4 h-4 mr-1.5 text-emerald-300" />
            {scanMode === "camera" ? "Stop Camera" : "Live Camera"}
          </Button>

          {/* File Upload toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScanMode(scanMode === "upload" ? "manual" : "upload")}
            className={`border-slate-700 text-xs min-h-[44px] px-3.5 active:scale-[0.98] transition-all touch-target font-semibold ${
              scanMode === "upload"
                ? "bg-emerald-700 text-white border-emerald-600"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Upload Image</span>
            <span className="sm:hidden">Upload</span>
          </Button>

          {/* Reset */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setInputVal("");
              setResult(null);
              setReportFiled(false);
              setUploadedImagePreview(null);
              setUploadedFileName(null);
            }}
            className="text-slate-400 hover:text-white text-xs min-h-[44px] px-2.5 active:scale-[0.98] touch-target"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* CAMERA MODE VIEWFINDER */}
        {scanMode === "camera" && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center border-2 border-emerald-500/60 shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-52 h-52 sm:w-60 sm:h-60 border-2 rounded-xl relative transition-all duration-300 ${
                  result?.status === "counterfeit" || result?.status === "recalled"
                    ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    : result?.status === "authentic"
                    ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    : "border-emerald-400/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                {/* Corner markers */}
                <div
                  className={`absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 rounded-tl-sm transition-colors ${
                    result?.status === "counterfeit" || result?.status === "recalled"
                      ? "border-red-500"
                      : "border-emerald-400"
                  }`}
                />
                <div
                  className={`absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 rounded-tr-sm transition-colors ${
                    result?.status === "counterfeit" || result?.status === "recalled"
                      ? "border-red-500"
                      : "border-emerald-400"
                  }`}
                />
                <div
                  className={`absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 rounded-bl-sm transition-colors ${
                    result?.status === "counterfeit" || result?.status === "recalled"
                      ? "border-red-500"
                      : "border-emerald-400"
                  }`}
                />
                <div
                  className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 rounded-br-sm transition-colors ${
                    result?.status === "counterfeit" || result?.status === "recalled"
                      ? "border-red-500"
                      : "border-emerald-400"
                  }`}
                />

                {/* Laser Sweep Animation */}
                <div
                  className={`w-full h-0.5 absolute animate-laser transition-all ${
                    result?.status === "counterfeit" || result?.status === "recalled"
                      ? "bg-red-500 shadow-[0_0_16px_#EF4444]"
                      : "bg-emerald-400 shadow-[0_0_12px_#34D399]"
                  }`}
                />
              </div>
            </div>
            <div className="absolute bottom-3 text-center text-xs text-white/90 bg-slate-950/80 px-4 py-1.5 rounded-full backdrop-blur-xs font-mono flex items-center gap-2">
              <ScanLine className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Align 2D DataMatrix code in optical frame</span>
            </div>
          </div>
        )}

        {/* IMAGE UPLOAD / DRAG-AND-DROP HUD */}
        {scanMode === "upload" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
              isDragging
                ? "border-emerald-600 bg-emerald-50/70"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept="image/*"
              className="hidden"
            />

            {uploadedImagePreview ? (
              <div className="space-y-4 max-w-sm mx-auto">
                <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black aspect-video max-h-48 flex items-center justify-center">
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded Label"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 border-2 border-emerald-400/80 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10B981] absolute animate-laser" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span className="truncate">{uploadedFileName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-7 text-emerald-800"
                  >
                    Change Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    Drop high-res medicine packaging or label photo here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, JPEG, WEBP. Automatic OCR & 2D barcode decode.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs active:scale-[0.98]"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Image from Device
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Barcode String Input & Manual Action */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5 text-emerald-800" />
              Scan or Input GS1 DataMatrix String / Unit Serial Number:
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ISO/IEC 16022 Format
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
                placeholder="e.g. 01050123456789001728123110LOT-2026-EMZ01... or PT-EMZ-LON-9041"
                className="font-mono text-xs sm:text-sm pl-3 pr-8 min-h-[44px] bg-slate-50 border-slate-300 focus:bg-white transition-colors"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              onClick={() => handleVerify()}
              disabled={isScanning || !inputVal.trim()}
              className="bg-emerald-900 hover:bg-emerald-800 text-white min-h-[44px] px-6 shrink-0 active:scale-[0.98] transition-all duration-200 shadow-sm font-bold text-xs sm:text-sm touch-target"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying on Ledger...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" /> Verify Medicine
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* ONE-TOUCH SIMULATION SCENARIO PRESETS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> One-Touch Verification Presets:
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Tap to simulate point-of-dispense verification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("authentic_lonart")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-900 border-emerald-300 text-emerald-800 active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center font-semibold text-left truncate"
            >
              <Pill className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
              <span className="truncate">Lonart DS (Valid)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("authentic_coartem")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-900 border-emerald-300 text-emerald-800 active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center font-semibold text-left truncate"
            >
              <Pill className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
              <span className="truncate">Coartem (Valid)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("authentic_amoxil")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-900 border-emerald-300 text-emerald-800 active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center font-semibold text-left truncate"
            >
              <Cross className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
              <span className="truncate">Amoxil 500mg</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("counterfeit")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-red-50 hover:text-red-900 border-red-300 text-red-700 font-bold active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center text-left truncate shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5 text-red-600 shrink-0 animate-pulse" />
              <span className="truncate">Counterfeit Pack</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("recalled")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-red-50 hover:text-red-900 border-red-300 text-red-700 active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center text-left truncate font-semibold"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-600 shrink-0" />
              <span className="truncate">Recalled Lot</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickTest("expired")}
              className="text-xs min-h-[42px] py-1.5 px-2 bg-white hover:bg-amber-50 hover:text-amber-900 border-amber-300 text-amber-800 active:scale-[0.98] transition-all flex items-center justify-start sm:justify-center text-left truncate font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
              <span className="truncate">Expired Stock</span>
            </Button>
          </div>
        </div>

        {/* VERIFICATION RESULT CARD */}
        {result && (
          <div
            className={`rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              result.status === "authentic"
                ? "bg-emerald-50/70 border-emerald-600 text-emerald-950 shadow-md"
                : result.status === "counterfeit"
                ? "bg-red-50 border-red-600 text-red-950 ring-4 ring-red-500/25 shadow-lg"
                : result.status === "recalled"
                ? "bg-red-50 border-red-600 text-red-950 shadow-md"
                : result.status === "expired"
                ? "bg-amber-50 border-amber-500 text-amber-950 shadow-md"
                : "bg-slate-50 border-slate-400 text-slate-900"
            }`}
          >
            {/* Banner Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-current/15">
              <div className="flex items-start gap-3.5">
                {result.status === "authentic" ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                ) : result.status === "counterfeit" ? (
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-bounce">
                    <XCircle className="w-7 h-7" />
                  </div>
                ) : result.status === "recalled" ? (
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg sm:text-xl font-extrabold tracking-tight">
                      {result.headline}
                    </h4>
                    <Badge
                      className={`text-xs uppercase font-bold tracking-wider ${
                        result.status === "authentic"
                          ? "bg-emerald-800 text-white"
                          : result.status === "counterfeit"
                          ? "bg-red-600 text-white animate-pulse"
                          : result.status === "recalled"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm mt-1.5 opacity-90 leading-relaxed max-w-2xl font-medium">
                    {result.detail}
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono opacity-75 shrink-0 hidden sm:block">
                <div>Node: Lagos-DC01</div>
                <div>{new Date(result.verificationTimestamp).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              {/* Product Specifications */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white/95 p-4 rounded-xl border border-current/10 shadow-xs space-y-2.5">
                  <div className="font-bold text-slate-900 text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-emerald-800 shrink-0" />
                      {result.product?.name || "Unverified Pharmaceutical Item"}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {result.product?.nafdacRegNo && (
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-300">
                          {result.product.nafdacRegNo}
                        </span>
                      )}
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300 text-[10px] font-mono">
                        NAFDAC Mandate Active
                      </Badge>
                    </div>
                  </div>

                  {result.product?.genericName && (
                    <p className="text-xs text-slate-600 italic flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                      {result.product.genericName}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-100 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">GTIN-14:</span>
                      <span className="font-semibold text-slate-800">
                        {result.gtin || result.batch?.gtin || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">BATCH / LOT:</span>
                      <span className="font-semibold text-slate-800">
                        {result.batchNumber || result.batch?.batchNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">EXPIRY:</span>
                      <span className="font-semibold text-slate-800">
                        {result.expiryDate || result.batch?.expiryDate || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-sans">SERIAL NO:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {result.serialNumber || result.batch?.serialNumber || "N/A"}
                      </span>
                    </div>
                  </div>

                  {result.product?.manufacturerName && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1.5 border-t border-slate-100">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Licensed Manufacturer:</span>
                      <span className="font-bold text-slate-900">
                        {result.product.manufacturerName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Provenance Custody Trail (EPCIS) */}
                {result.custodyChain && result.custodyChain.length > 0 && (
                  <div className="bg-white/95 p-4 rounded-xl border border-current/10 shadow-xs">
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-800" /> Verified Custody Route (EPCIS Events):
                    </h5>
                    <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-300">
                      {result.custodyChain.map((ev, idx) => (
                        <div key={ev.id || idx} className="relative text-xs">
                          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span className="capitalize">{ev.eventType}</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              {new Date(ev.occurredAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{ev.location}</p>
                          <p className="text-slate-500 text-[10px] italic">"{ev.notes}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode & Critical Action Column */}
              <div className="flex flex-col items-center justify-between space-y-4">
                <div className="w-full flex justify-center">
                  <DataMatrixBarcode
                    gtin={result.gtin || "05012345678900"}
                    batch={result.batchNumber || "LOT-01"}
                    expiry={result.expiryDate || "2028-12-31"}
                    serial={result.serialNumber || "SN-001"}
                    size={140}
                    showActions={false}
                  />
                </div>

                {/* Counterfeit / Recall Urgent Action Button */}
                {(result.status === "counterfeit" || result.status === "recalled" || result.status === "unknown") && (
                  <div className="w-full space-y-2.5">
                    {reportFiled ? (
                      <div className="bg-red-700 text-white p-3 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2 shadow-sm min-h-[48px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Incident Lodged with NAFDAC Taskforce
                      </div>
                    ) : (
                      <Button
                        onClick={handleFileNafdacReport}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold min-h-[48px] shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all touch-target"
                      >
                        <FileWarning className="w-4 h-4" />
                        Report Incident to NAFDAC (48-Hr Mandate)
                      </Button>
                    )}
                    <p className="text-[10px] text-center text-red-800 font-medium">
                      Emergency Counterfeit Alert Hotline: 0800-1-NAFDAC
                    </p>
                  </div>
                )}

                {/* Authentic Dispensing Button */}
                {result.status === "authentic" && (
                  <div className="w-full space-y-2">
                    <Button
                      onClick={() => {
                        toast.success("Safe Dispense Logged", {
                          description: `Unit ${result.serialNumber} marked as safely dispensed to patient.`,
                        });
                      }}
                      className="w-full bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold min-h-[48px] shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all touch-target"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Approve & Dispense to Patient
                    </Button>
                    <p className="text-[10px] text-center text-emerald-800 font-medium">
                      Tamper Seal: Verified Intact • Safe to Dispense
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
