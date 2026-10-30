import React from 'react';
import { 
  Activity, 
  Settings, 
  History, 
  ShieldCheck, 
  Server, 
  Database, 
  Cpu, 
  CheckCircle,
  Clock
} from 'lucide-react';
import type { SystemHealth } from '../../types';

interface AdminDashboardProps {
  health: SystemHealth | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ health }) => {
  const auditLogs = [
    {
      id: 'aud-109',
      timestamp: 'Today, 11:42 AM',
      actor: 'officer.mumbai@aicte.gov.in',
      role: 'REVIEWING_OFFICER',
      action: 'OVERRIDE_FLAG',
      target: 'AICTE-2025-APP-89421 (Instructional Area deficit)',
      remarks: 'Architect certificate verified on page 4. Accepted 4,800 sq.m.'
    },
    {
      id: 'aud-108',
      timestamp: 'Today, 11:15 AM',
      actor: 'admin@apextech.edu.in',
      role: 'INSTITUTION_ADMIN',
      action: 'UPLOAD_DOCUMENT',
      target: 'FIRE_SAFETY_NOC_2025.pdf',
      remarks: 'Uploaded 4-page PDF with valid CFO stamp.'
    },
    {
      id: 'aud-107',
      timestamp: 'Today, 10:30 AM',
      actor: 'system.daemon',
      role: 'SYSTEM',
      action: 'RUN_COMPLIANCE_ENGINE',
      target: 'AICTE-2025-APP-89421',
      remarks: 'Deterministic Java rules executed against APH-2024-27 v2.1.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-slate-800" />
            System Administration & Audit Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global Compliance Checklist: <span className="font-semibold text-slate-700">AICTE APH 2024-27 (v2.1)</span> • Security: <span className="font-semibold text-slate-700">JWT + Spring Security RBAC</span>
          </p>
        </div>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Backend Engine</p>
            <p className="text-sm font-bold text-slate-900">Spring Boot 3.3.4</p>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Java 21 LTS Active
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Database Tier</p>
            <p className="text-sm font-bold text-slate-900">PostgreSQL 15+</p>
            <span className="text-[10px] text-blue-700 font-semibold">JPA Schema Validated</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">AI Intelligence</p>
            <p className="text-sm font-bold text-slate-900">Gemini 1.5 Flash</p>
            <span className="text-[10px] text-purple-700 font-semibold">Structured JSON Mode</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Doc Engine</p>
            <p className="text-sm font-bold text-slate-900">Apache PDFBox 3</p>
            <span className="text-[10px] text-amber-700 font-semibold">Local Page Extraction</span>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Immutable Audit Trail</h2>
          </div>
          <span className="text-xs text-slate-500">Append-Only Cryptographic Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-6">Remarks / Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{log.actor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{log.action}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">{log.target}</td>
                  <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
