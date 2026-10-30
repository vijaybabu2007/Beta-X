import React from 'react';
import { 
  FileCheck2, 
  Clock, 
  AlertCircle, 
  FileWarning, 
  ArrowUpRight, 
  CheckCircle, 
  Building2, 
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { ApplicationSummary } from '../../types';

interface InstitutionDashboardProps {
  onNavigateToWizard: () => void;
  onNavigateToDocs: () => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ 
  onNavigateToWizard, 
  onNavigateToDocs 
}) => {
  // Synthetic benchmark institutional applications
  const sampleApplications: ApplicationSummary[] = [
    {
      id: 'app-001',
      applicationNumber: 'AICTE-2025-APP-89421',
      institutionName: 'Apex Institute of Technology & Engineering',
      applicationType: 'EXTENSION_OF_APPROVAL',
      academicYear: '2025-2026',
      status: 'READINESS_CHECK_COMPLETE',
      readinessScore: 84,
      missingDocumentsCount: 1,
      criticalDeficitsCount: 1,
      lastUpdated: 'Today, 10:15 AM'
    },
    {
      id: 'app-002',
      applicationNumber: 'AICTE-2025-APP-91044',
      institutionName: 'Apex Institute of Technology & Engineering',
      applicationType: 'INTAKE_VARIATION',
      academicYear: '2025-2026',
      status: 'UNDER_SCRUTINY',
      readinessScore: 92,
      missingDocumentsCount: 0,
      criticalDeficitsCount: 0,
      lastUpdated: 'Yesterday'
    },
    {
      id: 'app-003',
      applicationNumber: 'AICTE-2025-APP-92318',
      institutionName: 'Apex Institute of Technology & Engineering',
      applicationType: 'NEW_COURSE',
      academicYear: '2025-2026',
      status: 'DRAFT',
      readinessScore: 45,
      missingDocumentsCount: 3,
      criticalDeficitsCount: 2,
      lastUpdated: '3 days ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-700" />
            Institutional Compliance Readiness Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AISHE Code: <span className="font-semibold text-slate-700">C-41290</span> • AICTE Permanent ID: <span className="font-semibold text-slate-700">1-48291039</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToDocs}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
          >
            Upload Documents
          </button>
          <button 
            onClick={onNavigateToWizard}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Readiness Check
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Readiness Score</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">84%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">High Readiness</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">18 of 21 APH Norms Verified</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Applications</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">3</span>
            <span className="text-xs text-slate-500">Cycle 2025-26</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">1 Under Scrutiny • 1 Ready • 1 Draft</p>
        </div>

        {/* Missing Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Missing Documents</span>
            <span className="p-2 bg-red-50 text-red-700 rounded-lg">
              <FileWarning className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">2</span>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">Action Required</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Fire Safety NOC & Land Conversion</p>
        </div>

        {/* Review SLA Countdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scrutiny Window</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700">4 Days</span>
            <span className="text-xs text-slate-500">Deadline: 15 Nov</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Cure window closes at 11:59 PM</p>
        </div>
      </div>

      {/* Advisory Findings Alert Box */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong className="font-bold">ReguFlow Advisory Engine Summary:</strong> Automated cross-document scrutiny flagged 1 potential inconsistency in Application <code className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono">AICTE-2025-APP-89421</code>. Declared instructional area is 4,800 sq.m while the uploaded Building Plan indicates 4,620 sq.m (Deficit: 180 sq.m). Upload an architect-certified affidavit or adjust intake claims.
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institutional Applications</h2>
            <p className="text-xs text-slate-500">Track readiness check status and officer review progress</p>
          </div>
          <span className="text-xs text-slate-500">Showing 3 of 3 records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Application ID</th>
                <th className="py-3 px-4">Application Type</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Readiness Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deficiencies</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {sampleApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {app.applicationNumber}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {app.applicationType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-4 px-4 text-slate-600">{app.academicYear}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        app.readinessScore >= 80 ? 'text-emerald-700' : 
                        app.readinessScore >= 60 ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {app.readinessScore}%
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${
                            app.readinessScore >= 80 ? 'bg-emerald-500' : 
                            app.readinessScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${app.readinessScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      app.status === 'UNDER_SCRUTINY' 
                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                        : app.status === 'READINESS_CHECK_COMPLETE' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {app.missingDocumentsCount > 0 ? (
                      <span className="text-red-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {app.missingDocumentsCount} Missing
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-blue-700 hover:text-blue-900 font-bold hover:underline inline-flex items-center gap-1">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
