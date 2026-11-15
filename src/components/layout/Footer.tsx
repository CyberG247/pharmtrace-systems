import React from "react";
import { Link } from "@tanstack/react-router";
import { Shield, PhoneCall, Mail, ExternalLink, Award, FileText } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Footer: Institutional Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mandate */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Pharm<span className="text-emerald-400">Trace</span> Systems
                </span>
                <p className="text-[11px] text-emerald-400 font-mono">
                  Federal Republic of Nigeria • NAFDAC Traceability Mesh
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The national GS1 DataMatrix serialization and verified B2B procurement infrastructure protecting Nigeria’s drug supply chain from falsified, substandard, and diverted medical products.
            </p>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <Award className="w-3.5 h-3.5" />
                <span>NAFDAC 5-Year Traceability Mandate (2020–2025/2027)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                End-to-end GS1 DataMatrix unit serialization, EPCIS event reporting, and PCN-verified pharmacy distribution.
              </p>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              System Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard/manufacturer" className="hover:text-emerald-400 transition-colors">
                  Serialization Hub (GS1)
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manufacturer" className="hover:text-emerald-400 transition-colors">
                  EPCIS Event Logger
                </Link>
              </li>
              <li>
                <Link to="/dashboard/pharmacy" className="hover:text-emerald-400 transition-colors">
                  Instant Barcode Verifier
                </Link>
              </li>
              <li>
                <Link to="/dashboard/pharmacy" className="hover:text-emerald-400 transition-colors">
                  Verified B2B Marketplace
                </Link>
              </li>
              <li>
                <Link to="/dashboard/pharmacy" className="hover:text-emerald-400 transition-colors">
                  Healthcare BNPL Financing
                </Link>
              </li>
              <li>
                <Link to="/dashboard/regulator" className="hover:text-emerald-400 transition-colors">
                  48-Hr Incident Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory Stakeholders */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              Regulatory Alignment
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                NAFDAC MAS & Pharmacovigilance
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                GS1 Nigeria Healthcare Standards
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Pharmacy Council of Nigeria (PCN)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Federal Ministry of Health (FMoH)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Nigeria Customs Service Port Intercept
              </li>
            </ul>
          </div>

          {/* Emergency Hotline & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100">
              Emergency & Sentinel
            </h4>
            <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 space-y-2">
              <div className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>NAFDAC Rapid Alert Line:</span>
              </div>
              <p className="font-mono text-sm font-bold text-white tracking-wide">
                0800-1-NAFDAC
              </p>
              <p className="text-[10px] text-slate-400">
                Toll-free 24/7 hotline to report suspect fake drugs or tamper breaches.
              </p>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>pharmacovigilance@nafdac.gov.ng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PharmTrace Systems Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[11px]">ISO/IEC 16022 & GS1 Healthcare Barcode Compliant</span>
            <span className="text-[11px] text-emerald-400 font-mono">Central Trust Mesh v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
