import React, { useState, useEffect, useCallback } from 'react';
import type { UserRole, SystemHealth, ApplicationSummary } from './types';
import { api } from './services/api';
import { GovHeader } from './components/layout/GovHeader';
import { Sidebar } from './components/layout/Sidebar';
import { InstitutionDashboard } from './components/dashboard/InstitutionDashboard';
import { OfficerDashboard } from './components/dashboard/OfficerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { NewApplicationWizard } from './components/institution/NewApplicationWizard';
import { DocumentLocker } from './components/documents/DocumentLocker';
import { BookOpen, Bot } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('INSTITUTION_ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string; role: UserRole } | null>({
    email: 'admin@apextech.edu.in',
    fullName: 'Dr. Rajesh Verma',
    role: 'INSTITUTION_ADMIN',
  });

  // Fetch applications from Spring Boot backend
  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const data = await api.applications.list();
      setApplications(data);
    } catch (err) {
      console.warn('Backend unavailable, using fallback benchmark data', err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // Poll backend health status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await api.health();
        if (res && res.status === 'UP') {
          setHealth(res);
          setBackendOnline(true);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    checkBackend();
    loadApplications();
    const interval = setInterval(checkBackend, 6000);
    return () => clearInterval(interval);
  }, [loadApplications]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'INSTITUTION_ADMIN') {
      setCurrentUser({
        email: 'admin@apextech.edu.in',
        fullName: 'Dr. Rajesh Verma',
        role: 'INSTITUTION_ADMIN',
      });
      setActiveTab('dashboard');
    } else if (newRole === 'REVIEWING_OFFICER') {
      setCurrentUser({
        email: 'officer.mumbai@aicte.gov.in',
        fullName: 'Sanjay Kulkarni (Regional Officer)',
        role: 'REVIEWING_OFFICER',
      });
      setActiveTab('officer_queue');
    } else if (newRole === 'SYSTEM_ADMIN') {
      setCurrentUser({
        email: 'director.approval@aicte.gov.in',
        fullName: 'Prof. Anil Sahasrabudhe',
        role: 'SYSTEM_ADMIN',
      });
      setActiveTab('system_health');
    }
  };

  const handleLoginSuccess = (user: { email: string; fullName: string; role: UserRole; token: string }) => {
    setCurrentUser(user);
    handleRoleChange(user.role);
    loadApplications();
  };

  const handleLogout = () => {
    localStorage.removeItem('reguflow_jwt');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Official Government Header */}
      <GovHeader 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
        backendOnline={backendOnline}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
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
                  applications={applications}
                  loading={loadingApps}
                  onRefresh={loadApplications}
                  onNavigateToWizard={() => setActiveTab('new_application')}
                  onNavigateToDocs={() => setActiveTab('documents')}
                />
              )}
              {activeTab === 'applications' && (
                <InstitutionDashboard 
                  applications={applications}
                  loading={loadingApps}
                  onRefresh={loadApplications}
                  onNavigateToWizard={() => setActiveTab('new_application')}
                  onNavigateToDocs={() => setActiveTab('documents')}
                />
              )}
              {activeTab === 'new_application' && (
                <NewApplicationWizard 
                  onCancel={() => setActiveTab('dashboard')}
                  onSuccess={() => {
                    loadApplications();
                    setActiveTab('dashboard');
                  }}
                />
              )}
              {activeTab === 'documents' && (
                <DocumentLocker 
                  applicationId={applications.length > 0 ? applications[0].id : 1}
                />
              )}
              {activeTab === 'knowledge_bot' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">AICTE Handbook RAG Assistant (Phase 5)</h2>
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

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
