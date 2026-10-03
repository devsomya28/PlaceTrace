import React from 'react';
import { Experiment } from '../types/placement';

interface ExperimentsViewProps {
  experiments: Experiment[];
  onUpdateExperiment: (exp: Experiment) => void;
  onOpenRecordOutcomeModal: (experimentId?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  experiments,
  onUpdateExperiment,
  onOpenRecordOutcomeModal,
  onNavigateTab,
}) => {
  const handleToggleActivate = (exp: Experiment) => {
    const newStatus = exp.status === 'in_progress' ? 'ready' : 'in_progress';
    const updated = {
      ...exp,
      status: newStatus as any,
      currentSamples: newStatus === 'in_progress' ? Math.max(1, exp.currentSamples) : exp.currentSamples,
    };
    onUpdateExperiment(updated);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Dual Mode Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-[#8083ff] font-mono text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#8083ff] animate-pulse"></span>
            <span>Controlled Placement Diagnostics // Dual Mode</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d4e4fa] tracking-tight">
            Don't guess. Run an experiment.
          </h1>
          <p className="text-sm sm:text-base text-[#c7c4d7] max-w-2xl leading-relaxed">
            Change one variable, measure the outcome, and learn from your next placement applications. Empirical rigor over speculative prep.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#1c2b3c] border border-[#273647] shrink-0">
          <button
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#8083ff] text-[#0d0096] shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">science</span>
            <span>Active & Suggested</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#0d0096]/20 text-[#0d0096] text-[10px]">
              {experiments.length}
            </span>
          </button>
          <button
            onClick={() => onNavigateTab('cohort')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#c7c4d7] hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">group_work</span>
            <span>Cohort Intelligence</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#122131] text-[#7bd0ff] text-[10px] border border-[#273647]">
              Preview
            </span>
          </button>
        </div>
      </div>

      {/* Protocol Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0d1c2d] p-4 rounded-xl border border-[#273647]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c2b3c] border border-[#273647] flex items-center justify-center text-[#8083ff] shrink-0">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </div>
          <div>
            <div className="text-xs text-[#c7c4d7] uppercase font-mono">Isolation Protocol</div>
            <div className="text-sm font-semibold text-[#d4e4fa]">One parameter per 3 apps</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c2b3c] border border-[#273647] flex items-center justify-center text-[#4edea3] shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <div className="text-xs text-[#c7c4d7] uppercase font-mono">Telemetry Integrity</div>
            <div className="text-sm font-semibold text-[#d4e4fa]">Strict outcome verification</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c2b3c] border border-[#273647] flex items-center justify-center text-[#7bd0ff] shrink-0">
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </div>
          <div>
            <div className="text-xs text-[#c7c4d7] uppercase font-mono">Convergence Goal</div>
            <div className="text-sm font-semibold text-[#d4e4fa]">Isolate true bottleneck</div>
          </div>
        </div>
      </div>

      {/* 3 Experiment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {experiments.map((exp) => {
          const isErrorBadge = exp.badgeType === 'error';
          const isSecondaryBadge = exp.badgeType === 'secondary';
          const isInProgress = exp.status === 'in_progress';
          const progressPercent = Math.min(100, Math.round((exp.currentSamples / exp.sampleThreshold) * 100));

          return (
            <div
              key={exp.id}
              className="flex flex-col justify-between bg-[#122131] border border-[#273647] rounded-xl p-6 shadow-md hover:border-[#464554] transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase ${
                      isErrorBadge
                        ? 'bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/30'
                        : isSecondaryBadge
                        ? 'bg-[#00a6e0]/20 text-[#7bd0ff] border border-[#7bd0ff]/30'
                        : 'bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isErrorBadge ? 'bg-[#ffb4ab] animate-ping' : isSecondaryBadge ? 'bg-[#7bd0ff]' : 'bg-[#4edea3]'
                      }`}
                    ></span>
                    <span>{exp.badge}</span>
                  </span>
                  <span className="font-mono text-xs text-[#c7c4d7]">{exp.code}</span>
                </div>

                {/* Title & Why */}
                <div>
                  <h2 className="text-lg font-bold text-[#d4e4fa] tracking-tight">
                    {exp.title}
                  </h2>
                  <div className="mt-2.5 p-3 rounded-lg bg-[#1c2b3c] border border-[#273647]">
                    <div className="flex items-start gap-2 text-[#c7c4d7]">
                      <span className="material-symbols-outlined text-[#7bd0ff] text-[16px] mt-0.5 shrink-0">
                        troubleshoot
                      </span>
                      <p className="text-xs leading-relaxed">
                        <strong className="text-[#d4e4fa]">Diagnostic Why:</strong> {exp.diagnosticWhy}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions & Measurable */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-[#0d1c2d] border border-[#1c2b3c]">
                    <span className="text-[11px] text-[#8083ff] uppercase font-mono block mb-1 font-semibold">
                      Action To Take
                    </span>
                    <p className="text-xs text-[#d4e4fa] leading-relaxed">
                      {exp.actionToTake}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0d1c2d] border border-[#1c2b3c]">
                    <span className="text-[11px] text-[#4edea3] uppercase font-mono block mb-1 font-semibold">
                      Measurable Telemetry
                    </span>
                    <p className="text-xs text-[#c7c4d7] leading-relaxed">
                      {exp.measurableTelemetry}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-[#c7c4d7] mb-1 font-mono">
                    <span className={isInProgress ? 'text-[#7bd0ff]' : ''}>
                      {exp.variantName || 'Sample Confidence'}
                    </span>
                    <span>
                      {exp.currentSamples}/{exp.sampleThreshold} Samples ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#273647] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isErrorBadge ? 'bg-[#8083ff]' : isSecondaryBadge ? 'bg-[#7bd0ff]' : 'bg-[#4edea3]'
                      }`}
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-5 mt-4 border-t border-[#273647] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#4edea3]">
                  <span className="material-symbols-outlined text-[16px]">
                    {isInProgress ? 'refresh' : 'radio_button_checked'}
                  </span>
                  <span>{isInProgress ? 'In Progress' : 'Ready to start'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenRecordOutcomeModal(exp.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#1c2b3c] text-[#d4e4fa] hover:bg-[#273647] border border-[#273647] text-xs font-semibold transition-colors cursor-pointer"
                    type="button"
                  >
                    Log Run
                  </button>
                  <button
                    onClick={() => handleToggleActivate(exp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                      isInProgress
                        ? 'bg-[#1c2b3c] text-[#7bd0ff] border border-[#7bd0ff]/40 hover:bg-[#273647]'
                        : 'bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff]'
                    }`}
                    type="button"
                  >
                    {isInProgress ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Next Outcome Callout */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1c2b3c] via-[#122131] to-[#0d1c2d] border border-[#273647] p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8083ff]/10 border border-[#8083ff]/30 flex items-center justify-center text-[#8083ff] shrink-0">
            <span className="material-symbols-outlined text-[26px]">notification_important</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#d4e4fa]">
              Logged a new OA or interview update?
            </h3>
            <p className="text-xs sm:text-sm text-[#c7c4d7] mt-0.5">
              Keep current experiments calibrated by attaching freshly concluded outcomes immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onOpenRecordOutcomeModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#8083ff] text-[#0d0096] font-semibold text-xs sm:text-sm hover:bg-[#c0c1ff] hover:text-[#1000a9] transition-all shadow-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>Record Next Outcome</span>
          </button>
        </div>
      </div>
    </div>
  );
};
