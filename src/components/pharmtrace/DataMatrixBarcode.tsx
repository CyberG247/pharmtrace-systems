import React, { useMemo } from "react";
import { generateDataMatrixPattern, formatGs1HumanReadable } from "@/lib/pharmtrace-data";
import { Copy, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DataMatrixBarcodeProps {
  gtin: string;
  batch: string;
  expiry: string;
  serial: string;
  size?: number;
  showHri?: boolean;
  className?: string;
  showActions?: boolean;
}

export const DataMatrixBarcode: React.FC<DataMatrixBarcodeProps> = ({
  gtin,
  batch,
  expiry,
  serial,
  size = 140,
  showHri = true,
  className = "",
  showActions = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const payload = useMemo(() => {
    const yyMMdd = expiry.slice(2).replaceAll("-", "");
    return `01${gtin}17${yyMMdd}10${batch}\u001d21${serial}`;
  }, [gtin, batch, expiry, serial]);

  const hri = useMemo(() => {
    return formatGs1HumanReadable({ gtin, batch, expiry, serial });
  }, [gtin, batch, expiry, serial]);

  const matrix = useMemo(() => {
    return generateDataMatrixPattern(payload, 18);
  }, [payload]);

  const cellSize = size / matrix.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast.success("GS1 DataMatrix payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`inline-flex flex-col items-center bg-white p-3 rounded-lg border border-slate-200 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between w-full mb-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        <span>GS1 DataMatrix 2D</span>
        <span className="font-semibold text-emerald-800">ISO/IEC 16022</span>
      </div>

      {/* SVG 2D DataMatrix with finder and timing patterns */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges bg-white p-1 border border-slate-100"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000000"
              />
            ) : null,
          ),
        )}
      </svg>

      {/* Human Readable Interpretation (HRI) */}
      {showHri && (
        <div className="mt-2 text-center w-full">
          <p className="font-mono text-[11px] font-semibold text-slate-800 tracking-tight leading-tight select-all">
            {hri}
          </p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 text-[10px] font-mono text-slate-500 text-left border-t border-slate-100 pt-1">
            <div>
              <span className="text-slate-400">EXP:</span> {expiry}
            </div>
            <div>
              <span className="text-slate-400">LOT:</span> {batch}
            </div>
            <div className="col-span-2 truncate">
              <span className="text-slate-400">SN:</span> {serial}
            </div>
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 w-full justify-center">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Payload
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5 mr-1" /> Print
          </Button>
        </div>
      )}
    </div>
  );
};
