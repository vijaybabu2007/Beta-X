import React from 'react';
import type { UserRole } from '../../types';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  UploadCloud, 
  Bot, 
  Bell, 
  ClipboardCheck, 
  Eye, 
  Sliders, 
  MessageSquare, 
  Activity, 
  Settings, 
  History,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, onTabChange }) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'INSTITUTION_ADMIN':
        return [
          { id: 'dashboard', label: 'Readiness Dashboard', icon: LayoutDashboard },
          { id: 'applications', label: 'My Applications', icon: FileText, badge: '3' },
          { id: 'new_application', label: 'New Application', icon: PlusCircle },
          { id: 'documents', label: 'Document Locker', icon: UploadCloud, badge: '2 Missing' },
          { id: 'knowledge_bot', label: 'AICTE Handbook Bot', icon: Bot, isNew: true },
          { id: 'notifications', label: 'Alerts & Reminders', icon: Bell },
        ];
      case 'REVIEWING_OFFICER':
        return [
          { id: 'officer_queue', label: 'Scrutiny Queue', icon: ClipboardCheck, badge: '4 Pending' },
          { id: 'evidence_viewer', label: 'Document & Evidence', icon: Eye },
          { id: 'compliance_overrides', label: 'Findings & Overrides', icon: Sliders },
          { id: 'clarifications', label: 'Clarification Notices', icon: MessageSquare },
          { id: 'reports', label: 'Compliance Reports', icon: FileCheck },
        ];
      case 'SYSTEM_ADMIN':
        return [
          { id: 'system_health', label: 'System Telemetry', icon: Activity },
          { id: 'aph_rules', label: 'APH Checklist Rules', icon: Settings },
          { id: 'audit_logs', label: 'Immutable Audit Trail', icon: History },
          { id: 'security_governance', label: 'Security & RBAC', icon: ShieldCheck },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-5.5rem)] flex flex-col justify-between py-6 px-4 shrink-0 shadow-lg">
      <div>
        {/* Role Designation Tag */}
        <div className="mb-6 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Workspace</p>
          <p className="text-sm font-semibold text-white truncate">
            {currentRole === 'INSTITUTION_ADMIN' && 'Govt Engineering College'}
            {currentRole === 'REVIEWING_OFFICER' && 'AICTE Scrutiny Committee'}
            {currentRole === 'SYSTEM_ADMIN' && 'AICTE Approval Bureau'}
          </p>
          <span className="inline-block mt-1 text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            {currentRole.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-900/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.badge.includes('Missing') 
                      ? 'bg-red-900/80 text-red-200 border border-red-700' 
                      : 'bg-blue-900/80 text-blue-200 border border-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                    RAG
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">ReguFlow AI Core v1.0</p>
        <p>Spring Boot 3 • Java 21 • Postgres</p>
        <p className="text-[10px] text-slate-600">Strict Human-in-the-Loop Governance</p>
      </div>
    </aside>
  );
};
