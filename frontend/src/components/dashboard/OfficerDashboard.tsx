import React from 'react';
import { 
  ClipboardCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Sliders, 
  MessageSquare,
  ShieldAlert,
  Search
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-700" />
            Reviewing Officer Scrutiny Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Regional Office: <span className="font-semibold text-slate-700">Western Region (Mumbai)</span> • Committee: <span className="font-semibold text-slate-700">Scrutiny & EVC Bureau</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-3 py-1.5 rounded-lg border border-indigo-200">
            4 Applications in Queue
          </span>
        </div>
      </div>

      {/* Officer Governance Alert */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-indigo-700 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Review Officer Protocol:</strong> ReguFlow AI automated extractions and consistency flags are purely <em>advisory</em>. You are required to inspect the original PDF page citations before accepting, overriding, or issuing deficiency notices.
        </div>
      </div>

      {/* Scrutiny Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assigned Applications Queue</h2>
            <p className="text-xs text-slate-500">Cross-examine extracted facts against official APH 2024-27 norms</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Institute..." 
              className="pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">App Number</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">AI Advisory Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">
                  AICTE-2025-APP-89421
                </td>
                <td className="py-4 px-4 font-semibold text-slate-800">
                  Apex Institute of Technology
                </td>
                <td className="py-4 px-4 text-slate-600">Extension of Approval</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    1 Inconsistency Flagged
                  </span>
                </td>
                <td className="py-4 px-4 font-semibold text-slate-700">
                  94.2% (PDFBox + Gemini)
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800">
                      Scrutinize
                    </button>
                    <button className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded text-xs">
                      View PDF
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">
                  AICTE-2025-APP-91044
                </td>
                <td className="py-4 px-4 font-semibold text-slate-800">
                  Vidya Bharati College of Engg
                </td>
                <td className="py-4 px-4 text-slate-600">Intake Variation</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    All Checklist Rules Cleared
                  </span>
                </td>
                <td className="py-4 px-4 font-semibold text-slate-700">
                  98.1% (PDFBox + Gemini)
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800">
                      Scrutinize
                    </button>
                    <button className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded text-xs">
                      View PDF
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
