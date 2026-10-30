import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { UserRole, SystemHealth } from './types';
import { GovHeader } from './components/layout/GovHeader';
import { Sidebar } from './components/layout/Sidebar';
import { InstitutionDashboard } from './components/dashboard/InstitutionDashboard';
import { OfficerDashboard } from './components/dashboard/OfficerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { FileUp, BookOpen, Bot } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('INSTITUTION_ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Poll backend health status
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/health', {
          timeout: 2000
        });
        if (response.data && response.data.status === 'UP') {
          setHealth(response.data);
          setBackendOnline(true);
        }
      } catch (err) {
        // Backend offline or compiling
        setBackendOnline(false);
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'INSTITUTION_ADMIN') setActiveTab('dashboard');
    else if (newRole === 'REVIEWING_OFFICER') setActiveTab('officer_queue');
    else if (newRole === 'SYSTEM_ADMIN') setActiveTab('system_health');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Official Government Header */}
      <GovHeader 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
        backendOnline={backendOnline} 
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          currentRole={currentRole} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentRole === 'INSTITUTION_ADMIN' && (
            <>
              {activeTab === 'dashboard' && (
                <InstitutionDashboard 
                  onNavigateToWizard={() => setActiveTab('new_application')}
                  onNavigateToDocs={() => setActiveTab('documents')}
                />
              )}
              {activeTab === 'new_application' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Application Intake Wizard</h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Phase 2 will unlock the 5-step interactive institutional intake wizard with real-time APH rule calculation.
                  </p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-6 px-4 py-2 bg-blue-700 text-white font-semibold text-sm rounded-lg hover:bg-blue-800"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
              {activeTab === 'documents' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Document Locker & Intelligence</h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Phase 3 will unlock Apache PDFBox 3 page extraction, Document AI OCR fallback, and structured metric parsing.
                  </p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-6 px-4 py-2 bg-blue-700 text-white font-semibold text-sm rounded-lg hover:bg-blue-800"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
              {activeTab === 'knowledge_bot' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">AICTE Handbook RAG Assistant</h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                    Phase 5 will activate the Gemini RAG pipeline grounded in official AICTE handbook passages with page-level citations.
                  </p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-6 px-4 py-2 bg-blue-700 text-white font-semibold text-sm rounded-lg hover:bg-blue-800"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </>
          )}

          {currentRole === 'REVIEWING_OFFICER' && (
            <OfficerDashboard />
          )}

          {currentRole === 'SYSTEM_ADMIN' && (
            <AdminDashboard health={health} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
