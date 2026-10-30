import React from 'react';
import type { UserRole } from '../../types';
import { Shield, Bell, AlertTriangle, User, LogIn, LogOut } from 'lucide-react';

interface GovHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  backendOnline: boolean;
  user: { email: string; fullName: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({ 
  currentRole, 
  onRoleChange, 
  backendOnline,
  user,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Indian National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Emblems */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md border-2 border-amber-500">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Regu<span className="text-blue-700">Flow</span> <span className="text-amber-600">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  SIH26262 Prototype
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                AI-Powered Institutional Compliance Readiness & Review Platform
              </p>
            </div>
          </div>

          {/* Role Switcher & System Telemetry */}
          <div className="flex items-center space-x-4">
            {/* Backend Connectivity Status Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-slate-600 font-mono text-[11px]">
                {backendOnline ? 'Spring Boot 3 (Port 8080) Online' : 'Connecting Backend...'}
              </span>
            </div>

            {/* Role Switcher (Evaluation & Demo tool) */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-300 flex items-center space-x-1">
              <button
                onClick={() => onRoleChange('INSTITUTION_ADMIN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'INSTITUTION_ADMIN'
                    ? 'bg-blue-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Institution
              </button>
              <button
                onClick={() => onRoleChange('REVIEWING_OFFICER')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'REVIEWING_OFFICER'
                    ? 'bg-indigo-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Officer
              </button>
              <button
                onClick={() => onRoleChange('SYSTEM_ADMIN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'SYSTEM_ADMIN'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile / SSO Button */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.replace(/_/g, ' ').toLowerCase()}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Governance Disclaimer */}
      <div className="bg-amber-50 border-t border-b border-amber-200 px-4 py-1.5 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Statutory Governance:</strong> ReguFlow AI findings are strictly <em>advisory</em>. The system never makes autonomous approval/rejection decisions. All official actions require Reviewing Officer sign-off.
          </span>
        </div>
      </div>
    </header>
  );
};
