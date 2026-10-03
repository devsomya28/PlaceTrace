import React, { useState, useMemo } from 'react';
import { Application, StudentProfile, Experiment, DiagnosisReport } from './types/placement';
import { storageService } from './services/storageService';
import { analyticsService } from './services/analyticsService';
import { generateDeterministicDiagnosis } from './services/diagnosisGenerator';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ApplicationsView } from './components/ApplicationsView';
import { DiagnosisView } from './components/DiagnosisView';
import { ExperimentsView } from './components/ExperimentsView';
import { CohortView } from './components/CohortView';
import { ProfileView } from './components/ProfileView';
import { AddApplicationDrawer } from './components/AddApplicationDrawer';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { RecordOutcomeModal } from './components/RecordOutcomeModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Application & Profile State
  const [applications, setApplications] = useState<Application[]>(() =>
    storageService.getApplications()
  );
  const [profile, setProfile] = useState<StudentProfile>(() =>
    storageService.getProfile()
  );
  const [experiments, setExperiments] = useState<Experiment[]>(() =>
    storageService.getExperiments()
  );

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);
  const [isRecordOutcomeModalOpen, setIsRecordOutcomeModalOpen] = useState(false);
  const [targetExpIdForOutcome, setTargetExpIdForOutcome] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deterministic Funnel Analysis (updates automatically on every change to applications!)
  const funnelAnalysis = useMemo(() => {
    return analyticsService.calculateFunnel(applications);
  }, [applications]);

  // Diagnosis report state (can be updated by deterministic engine or Gemini AI)
  const [diagnosisReport, setDiagnosisReport] = useState<DiagnosisReport>(() => {
    return generateDeterministicDiagnosis(applications, profile);
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // CRUD Operations
  const handleSaveApplication = (app: Application) => {
    let updated: Application[];
    const exists = applications.some((a) => a.id === app.id);

    if (exists) {
      updated = storageService.updateApplication(app);
      showToast(`Updated telemetry for ${app.company}.`);
    } else {
      updated = storageService.addApplication(app);
      showToast(`Logged application to ${app.company}. Funnel recalculated.`);
    }

    setApplications(updated);
    setDiagnosisReport(generateDeterministicDiagnosis(updated, profile));
  };

  const handleDeleteApplication = (id: string) => {
    const toDelete = applications.find((a) => a.id === id);
    const updated = storageService.deleteApplication(id);
    setApplications(updated);
    setDiagnosisReport(generateDeterministicDiagnosis(updated, profile));
    showToast(`Removed ${toDelete?.company || 'application'} from telemetry.`);
  };

  const handleUpdateExperiment = (updatedExp: Experiment) => {
    const updatedList = storageService.updateExperiment(updatedExp);
    setExperiments(updatedList);
    showToast(`Experiment ${updatedExp.code} status updated.`);
  };

  const handleRecordOutcome = (
    appId: string,
    outcome: {
      oaScore?: string;
      shortlisted: 'yes' | 'no' | 'pending';
      interview: 'yes' | 'no' | 'pending';
      offer: 'yes' | 'no' | 'pending';
      notes?: string;
      experimentId?: string;
    }
  ) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const updatedApp: Application = {
      ...target,
      oaScore: outcome.oaScore || target.oaScore,
      shortlisted: outcome.shortlisted,
      interview: outcome.interview,
      offer: outcome.offer,
      notes: outcome.notes
        ? `${target.notes ? target.notes + ' • ' : ''}${outcome.notes}`
        : target.notes,
      experimentId: outcome.experimentId || target.experimentId,
    };

    const updatedApps = storageService.updateApplication(updatedApp);
    setApplications(updatedApps);

    // If an experiment was associated, increment its samples count
    if (outcome.experimentId) {
      const exp = experiments.find((e) => e.id === outcome.experimentId);
      if (exp) {
        const updatedExp: Experiment = {
          ...exp,
          currentSamples: Math.min(exp.sampleThreshold, exp.currentSamples + 1),
          status: 'in_progress',
        };
        storageService.updateExperiment(updatedExp);
        setExperiments(storageService.getExperiments());
      }
    }

    setDiagnosisReport(generateDeterministicDiagnosis(updatedApps, profile));
    showToast(`Recorded outcome for ${target.company}. Funnel telemetry updated.`);
  };

  const handleSaveProfile = (newProfile: StudentProfile) => {
    storageService.saveProfile(newProfile);
    setProfile(newProfile);
    showToast('Saved profile credentials.');
  };

  const handleResetToDemo = () => {
    const demoApps = storageService.resetToDemo();
    const demoProfile = storageService.getProfile();
    const demoExps = storageService.getExperiments();

    setApplications(demoApps);
    setProfile(demoProfile);
    setExperiments(demoExps);
    setDiagnosisReport(generateDeterministicDiagnosis(demoApps, demoProfile));
    showToast('Reset to standard PlaceTrace telemetry demo data.');
  };

  const handleExportJson = () => {
    const dataStr = storageService.exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placetrace-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported telemetry dataset.');
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col font-sans selection:bg-[#8083ff]/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => {
          setEditingApp(null);
          setIsAddModalOpen(true);
        }}
        profile={profile}
        applicationCount={applications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16 flex flex-col">
        {currentTab === 'dashboard' && (
          <DashboardView
            applications={applications}
            analysis={funnelAnalysis}
            experiments={experiments}
            onNavigateTab={setCurrentTab}
            onOpenAddModal={() => {
              setEditingApp(null);
              setIsAddModalOpen(true);
            }}
            onInspectApplication={setInspectingApp}
          />
        )}

        {currentTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            analysis={funnelAnalysis}
            onOpenAddModal={() => {
              setEditingApp(null);
              setIsAddModalOpen(true);
            }}
            onInspectApplication={setInspectingApp}
            onDeleteApplication={handleDeleteApplication}
            onEditApplication={(app) => {
              setEditingApp(app);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentTab === 'diagnosis' && (
          <DiagnosisView
            applications={applications}
            profile={profile}
            analysis={funnelAnalysis}
            report={diagnosisReport}
            onUpdateReport={setDiagnosisReport}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'experiments' && (
          <ExperimentsView
            experiments={experiments}
            onUpdateExperiment={handleUpdateExperiment}
            onOpenRecordOutcomeModal={(expId) => {
              setTargetExpIdForOutcome(expId);
              setIsRecordOutcomeModalOpen(true);
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'cohort' && (
          <CohortView
            analysis={funnelAnalysis}
            profile={profile}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            analysis={funnelAnalysis}
            onSaveProfile={handleSaveProfile}
            onResetToDemo={handleResetToDemo}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Add / Edit Application Drawer */}
      <AddApplicationDrawer
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApplication}
        editingApp={editingApp}
      />

      {/* Application Inspection Modal */}
      <ApplicationDetailModal
        application={inspectingApp}
        onClose={() => setInspectingApp(null)}
        onEdit={(app) => {
          setInspectingApp(null);
          setEditingApp(app);
          setIsAddModalOpen(true);
        }}
      />

      {/* Record Next Outcome Modal */}
      <RecordOutcomeModal
        isOpen={isRecordOutcomeModalOpen}
        onClose={() => {
          setIsRecordOutcomeModalOpen(false);
          setTargetExpIdForOutcome(undefined);
        }}
        applications={applications}
        experiments={experiments}
        selectedExperimentId={targetExpIdForOutcome}
        onRecordOutcome={handleRecordOutcome}
      />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c2b3c] border border-[#464554] text-[#d4e4fa] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-lg bg-[#00885d]/30 text-[#4edea3] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#d4e4fa]">PlaceTrace Telemetry</span>
            <span className="text-[11px] text-[#c7c4d7]">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
