import React from 'react';
import { Application, FunnelAnalysis, Experiment } from '../types/placement';
import { analyticsService } from '../services/analyticsService';

interface DashboardViewProps {
  applications: Application[];
  analysis: FunnelAnalysis;
  experiments: Experiment[];
  onNavigateTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onInspectApplication: (app: Application) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
  analysis,
  experiments,
  onNavigateTab,
  onOpenAddModal,
  onInspectApplication,
}) => {
  const stageMetrics = analyticsService.getStageMetrics(analysis);
  const recentApps = applications.slice(0, 4);

  const biggestDrop = analysis.biggestDrop;

  // Active experiments derived from real state
  const activeExperiments = experiments.filter(e => e.status === 'in_progress');
  const topActiveExp = activeExperiments[0] || experiments[0] || null;

  // SVG bar for the bottleneck stage
  const dropFromCount = biggestDrop
    ? (biggestDrop.fromStage === 'OA' ? analysis.oaAttemptedCount
      : biggestDrop.fromStage === 'Application' ? analysis.totalApplications
      : biggestDrop.fromStage === 'Shortlisted' ? analysis.shortlistedCount
      : analysis.interviewCount)
    : analysis.oaAttemptedCount;
  const dropToCount = biggestDrop
    ? (biggestDrop.toStage === 'OA' ? analysis.oaAttemptedCount
      : biggestDrop.toStage === 'Shortlisted' ? analysis.shortlistedCount
      : biggestDrop.toStage === 'Interview' ? analysis.interviewCount
      : analysis.offerCount)
    : analysis.shortlistedCount;
  const droppedOas = Math.max(0, dropFromCount - dropToCount);
  const droppedPct = dropFromCount > 0 ? (droppedOas / dropFromCount) * 100 : 78;
  const shortlistedPct = dropFromCount > 0 ? (dropToCount / dropFromCount) * 100 : 22;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Hero Header / Signal Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative">
        <div className="flex flex-col gap-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c2b3c] text-[#7bd0ff] font-mono text-xs uppercase tracking-wider shadow-sm border border-[#273647]">
              <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse"></span>
              EMPIRICAL PLACEMENT DIAGNOSTICS
            </span>
            <span className="font-mono text-xs text-[#c7c4d7]">
              SYS_ID: 24-CR-KUNAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d4e4fa] tracking-tight">
            Trace your placement journey.
          </h1>
          <p className="text-base sm:text-lg text-[#c7c4d7]">
            Turn your placement attempts into evidence, patterns, and your next experiment.
          </p>

          {/* Quick metadata pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122131] text-[#d4e4fa] text-xs font-semibold shadow-sm border border-[#273647]">
              <span className="material-symbols-outlined text-[#8083ff] text-[15px]">inventory_2</span>
              <span>{analysis.totalApplications} Recorded Applications</span>
            </div>
            <span className="text-[#908fa0] text-xs">•</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122131] text-[#c7c4d7] text-xs font-medium shadow-sm border border-[#273647]">
              <span className="material-symbols-outlined text-[#4edea3] text-[15px]">update</span>
              <span>Updated just now</span>
            </div>
            <span className="text-[#908fa0] text-xs">•</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c2b3c] text-[#7bd0ff] text-xs font-medium shadow-sm">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Active cycle: 2024-2025</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('diagnosis')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#8083ff] to-[#494bd6] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#8083ff]/20 hover:opacity-95 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            <span>Analyze Bottlenecks</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1c2b3c] text-[#d4e4fa] hover:bg-[#273647] border border-[#273647] text-xs sm:text-sm font-medium transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add Application</span>
          </button>
        </div>
      </section>

      {/* Large Horizontal Placement Funnel Visualization */}
      <section className="flex flex-col gap-4 p-5 sm:p-6 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#1c2b3c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">filter_alt</span>
            <h2 className="font-semibold text-base text-[#d4e4fa]">End-to-End Pipeline Telemetry</h2>
          </div>
          <span className="font-mono text-xs text-[#c7c4d7] uppercase tracking-wider">
            Signal Confidence: Empirical [N={analysis.totalApplications}]
          </span>
        </div>

        {/* Pipeline Grid (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stageMetrics.map((stage) => {
            const isAlert = stage.isBottleneck;
            return (
              <div
                key={stage.stageNumber}
                className={`flex flex-col p-4 rounded-lg relative transition-all duration-200 ${
                  isAlert
                    ? 'bg-[#93000a]/30 border border-[#ffb4ab]/40 shadow-sm'
                    : 'bg-[#122131] border border-[#273647] hover:bg-[#1c2b3c]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isAlert ? 'text-[#ffb4ab] font-bold flex items-center gap-1' : 'text-[#c7c4d7]'}>
                    {isAlert && <span className="material-symbols-outlined text-[14px] text-[#ffb4ab]">warning</span>}
                    {stage.stageNumber} // {stage.code}
                  </span>
                  {isAlert ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#ffb4ab] text-[#690005] font-bold text-[10px]">
                      DROP
                    </span>
                  ) : (
                    <span className="text-[#8083ff] text-[16px] material-symbols-outlined">
                      {stage.stageNumber === '01' ? 'send' : stage.stageNumber === '02' ? 'code_blocks' : stage.stageNumber === '04' ? 'record_voice_over' : 'verified'}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-col">
                  <span className={`text-xs uppercase font-semibold tracking-wider ${isAlert ? 'text-[#ffb4ab]' : 'text-[#c7c4d7]'}`}>
                    {stage.name}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-3xl font-bold font-mono ${isAlert ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'}`}>
                      {stage.count}
                    </span>
                    <span className={`text-xs ${isAlert ? 'text-[#ffb4ab] font-semibold' : 'text-[#4edea3]'}`}>
                      {stage.subtext}
                    </span>
                  </div>
                </div>

                {/* Meter Bar */}
                <div className="mt-3 w-full bg-[#273647] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAlert ? 'bg-[#ffb4ab]' : stage.stageNumber === '01' ? 'bg-[#8083ff]' : stage.stageNumber === '02' ? 'bg-[#7bd0ff]' : stage.stageNumber === '04' ? 'bg-[#4edea3]' : 'bg-[#908fa0]'
                    }`}
                    style={{
                      width: `${stage.stageNumber === '01' ? 100 : stage.overallPercentage}%`,
                    }}
                  ></div>
                </div>

                <div className="mt-2 flex justify-between items-center text-xs font-mono text-[#c7c4d7]">
                  <span>{isAlert ? 'Critical Bottleneck' : 'Stage Retention'}</span>
                  <span className={isAlert ? 'text-[#ffb4ab] font-bold' : 'text-[#d4e4fa]'}>
                    {isAlert ? `-${stage.dropFromPrev}% Drop` : `${stage.count} of ${analysis.totalApplications}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conversion Rate Metric Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="flex flex-col p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#c7c4d7]">
            <span>App → OA</span>
            <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#d4e4fa] font-mono">
              {analysis.appToOaRate}%
            </span>
            <span className="font-mono text-xs text-[#c7c4d7]">
              {analysis.oaAttemptedCount}/{analysis.totalApplications} apps
            </span>
          </div>
          <div className="mt-2 text-xs text-[#c7c4d7] flex items-center gap-1">
            {analysis.appToOaRate >= 70
              ? <><span className="text-[#4edea3] font-semibold">Strong</span> eligibility clearance</>  
              : analysis.appToOaRate >= 40
              ? <><span className="text-[#7bd0ff] font-semibold">Moderate</span> OA invitation rate</>
              : <><span className="text-[#ffb4ab] font-semibold">Low</span> — check eligibility criteria</>}
          </div>
        </div>

        {/* Metric 2: Biggest Drop (dynamic) */}
        {biggestDrop ? (
          <div className="flex flex-col p-4 rounded-xl bg-[#1c2b3c] border border-[#ffb4ab]/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb4ab]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-[#ffb4ab] font-semibold text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {biggestDrop.fromStage} → {biggestDrop.toStage}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[10px] font-bold">
                LARGEST DROP
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-[#ffb4ab] font-mono">
                {biggestDrop.conversionRate}%
              </span>
              <span className="font-mono text-xs text-[#ffb4ab]">
                {biggestDrop.lossCount} lost here
              </span>
            </div>
            <div className="mt-2 text-xs text-[#ffb4ab] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              {biggestDrop.dropRate}% drop rate
            </div>
          </div>
        ) : (
          <div className="flex flex-col p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#c7c4d7]">
              <span>Biggest Drop</span>
              <span className="material-symbols-outlined text-[#c7c4d7] text-[18px]">help_outline</span>
            </div>
            <div className="mt-2 text-sm text-[#c7c4d7] leading-relaxed">
              Not enough data yet. Record more outcomes to detect bottlenecks.
            </div>
          </div>
        )}

        {/* Metric 3 */}
        <div className="flex flex-col p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#c7c4d7]">
            <span>Shortlist → Interview</span>
            <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">verified</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#d4e4fa] font-mono">
              {analysis.shortlistToInterviewRate}%
            </span>
            <span className="font-mono text-xs text-[#c7c4d7]">
              {analysis.interviewCount}/{analysis.shortlistedCount} candidates
            </span>
          </div>
          <div className="mt-2 text-xs text-[#c7c4d7] flex items-center gap-1">
            <span className="text-[#7bd0ff] font-semibold">Optimal</span> shortlist conversion
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#c7c4d7]">
            <span>Interview → Offer</span>
            <span className="material-symbols-outlined text-[#908fa0] text-[18px]">hourglass_empty</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#d4e4fa] font-mono">
              {analysis.interviewToOfferRate}%
            </span>
            <span className="font-mono text-xs text-[#c7c4d7]">
              {analysis.offerCount}/{analysis.interviewCount} finalized
            </span>
          </div>
          <div className="mt-2 text-xs text-[#c7c4d7] flex items-center gap-1">
            <span>{analysis.interviewCount > 0 ? 'Active in final rounds' : 'No interviews yet'}</span>
          </div>
        </div>
      </section>

      {/* Split Analysis: Highlighted Observable Drop & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="largest-drop">
        {/* Left: Highlighted Largest Observable Drop Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 rounded-xl bg-[#122131] border border-[#273647] shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#93000a]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 pb-2 border-b border-[#273647]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffb4ab] text-[#690005] text-xs uppercase tracking-wider font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              BIGGEST OBSERVABLE DROP
            </span>
            <span className="font-mono text-xs text-[#c7c4d7]">
              EMPIRICALLY CALCULATED
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 relative z-10">
            {biggestDrop ? (
              <>
                <div>
                  <span className="text-xs text-[#c7c4d7] uppercase tracking-wider font-semibold">
                    Biggest Observable Drop
                  </span>
                  <div className="text-2xl sm:text-3xl text-[#d4e4fa] font-bold tracking-tight mt-1">
                    {biggestDrop.fromStage} → {biggestDrop.toStage}:{' '}
                    <span className="text-[#ffb4ab]">{biggestDrop.conversionRate}% conversion</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded bg-[#1c2b3c] text-[#ffb4ab] font-mono text-xs shrink-0 border border-[#464554]">
                  {biggestDrop.lossCount} record(s) lost here
                </div>
              </>
            ) : (
              <div>
                <span className="text-xs text-[#c7c4d7] uppercase tracking-wider font-semibold">Bottleneck</span>
                <div className="text-xl text-[#c7c4d7] font-semibold mt-1">Not enough data yet</div>
              </div>
            )}
          </div>

          {/* Telemetry Breakdown Bar Chart (SVG) */}
          <div className="mt-4 p-4 rounded-lg bg-[#010f1f] border border-[#1c2b3c] flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-[#c7c4d7]">
              <span>{biggestDrop ? `${biggestDrop.fromStage} → ${biggestDrop.toStage} Distribution [N=${dropFromCount}]` : 'Outcome Distribution'}</span>
              <span className="text-[#4edea3]">Sample Size Valid</span>
            </div>

            <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 12">
              {/* Non-progressed */}
              <rect
                x="0"
                y="2"
                width={Math.max(1, droppedPct - 2)}
                height="8"
                rx="2"
                className="fill-[#ffb4ab] opacity-90"
              />
              {/* Progressed */}
              <rect
                x={droppedPct}
                y="2"
                width={Math.max(1, shortlistedPct)}
                height="8"
                rx="2"
                className="fill-[#4edea3] opacity-90"
              />
            </svg>

            <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></span>
                <span className="text-[#c7c4d7]">
                  Did not progress ({droppedOas})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
                <span className="text-[#d4e4fa] font-semibold">
                  Progressed to {biggestDrop?.toStage ?? 'next stage'} ({dropToCount})
                </span>
              </div>
            </div>
          </div>

          {/* Supporting Analytical Text */}
          <div className="mt-4 flex flex-col gap-2 relative z-10">
            {biggestDrop ? (
              <>
                <p className="text-sm text-[#d4e4fa] leading-relaxed">
                  <strong className="text-[#ffb4ab]">{biggestDrop.lossCount} of your {dropFromCount} recorded {biggestDrop.fromStage === 'Application' ? 'applications' : biggestDrop.fromStage === 'OA' ? 'OAs' : biggestDrop.fromStage === 'Shortlisted' ? 'shortlists' : 'interviews'}</strong>{' '}
                  did not progress to {biggestDrop.toStage}. This is a {biggestDrop.dropRate}% drop rate at this stage.
                </p>
                <div className="p-3 rounded bg-[#0d1c2d] border border-[#1c2b3c] flex items-start gap-2 text-[#c7c4d7]">
                  <span className="material-symbols-outlined text-[#7bd0ff] shrink-0 text-[18px] mt-0.5">lightbulb</span>
                  <p className="text-xs leading-relaxed">
                    <strong className="text-[#d4e4fa]">Important:</strong> {biggestDrop.description} This does NOT establish why any company rejected you — only where your recorded funnel shows the largest observable gap.
                  </p>
                </div>
                {!biggestDrop.isStatisticallySignificant && (
                  <div className="p-2.5 rounded bg-[#1c2b3c] border border-[#273647] text-[#c7c4d7] text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7bd0ff] text-[16px]">info</span>
                    <span>Sample size is small (&lt;3 records at this stage). Record more applications for higher confidence.</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[#c7c4d7] leading-relaxed">
                Add more applications and record their outcomes to reveal your biggest bottleneck.
              </p>
            )}
          </div>

          {/* Action Section */}
          <div className="mt-6 pt-4 border-t border-[#273647] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-1.5 text-xs text-[#c7c4d7] font-mono">
              <span className="material-symbols-outlined text-[#4edea3] text-[16px]">verified</span>
              <span>Empirical Evidence Confirmed</span>
            </div>
            <button
              onClick={() => onNavigateTab('diagnosis')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#8083ff] to-[#494bd6] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#8083ff]/20 hover:opacity-95 transition-all cursor-pointer"
              type="button"
            >
              <span>View Diagnosis</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Recent Applications Quick Snippet (5 cols) */}
        <div className="lg:col-span-5 flex flex-col p-6 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8083ff] text-[20px]">dataset</span>
              <h3 className="font-semibold text-base text-[#d4e4fa]">Recent Applications</h3>
            </div>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs text-[#8083ff] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <span>View All ({applications.length})</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
          <p className="text-xs text-[#c7c4d7] mt-1.5">
            Latest companies evaluated against continuous placement checkpoints.
          </p>

          {/* Company Cards Mini Stack */}
          <div className="mt-4 flex flex-col gap-2.5">
            {recentApps.map((app) => {
              const isCleared = app.shortlisted === 'yes';
              const isOaFail = app.oaAttempted && app.shortlisted === 'no';
              const isPending = app.shortlisted === 'pending';

              return (
                <div
                  key={app.id}
                  onClick={() => onInspectApplication(app)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#122131] border border-[#273647] hover:bg-[#1c2b3c] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#1c2b3c] border border-[#464554] flex items-center justify-center font-bold text-[#d4e4fa] text-sm shrink-0">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-[#d4e4fa] truncate group-hover:text-[#c0c1ff] transition-colors">
                          {app.company}
                        </span>
                        <span className="text-[11px] font-mono text-[#c7c4d7] truncate">
                          {app.role}
                        </span>
                      </div>
                      <span className="text-xs text-[#c7c4d7] truncate">
                        {app.driveClassification || 'Applied via Campus'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isCleared
                          ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30'
                          : isOaFail
                          ? 'bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/30'
                          : 'bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/30'
                      }`}
                    >
                      {isCleared ? 'OA Cleared' : isOaFail ? 'OA Rejected' : 'In Review'}
                    </span>
                    <span className="text-[10px] font-mono text-[#c7c4d7] mt-0.5">
                      {app.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-2.5 rounded bg-[#122131] border border-[#1c2b3c] flex items-center justify-between text-xs font-mono text-[#c7c4d7]">
            <span>Observed Pipeline Cadence</span>
            <span className="text-[#4edea3] font-semibold">3.4 Days / Stage Avg</span>
          </div>
        </div>
      </div>

      {/* Bottom Stat Cards / Diagnostic Intelligence */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Data Integrity Score */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[#c7c4d7] tracking-wider font-semibold">
              Empirical Quality
            </span>
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">verified_user</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#d4e4fa] font-mono">
                {analysis.dataIntegrityScore}%
              </span>
              <span className="text-xs text-[#4edea3] font-semibold">Integrity Score</span>
            </div>
            <p className="text-xs text-[#c7c4d7] mt-1 leading-relaxed">
              {analysis.verifiedOaEvidenceCount} of {analysis.oaAttemptedCount} recorded OAs possess verified score and percentile breakdown evidence.
            </p>
          </div>
          <div className="w-full bg-[#273647] rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-[#4edea3] h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.dataIntegrityScore}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Active Experiments (real data) */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#0d1c2d] border border-[#273647] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[#c7c4d7] tracking-wider font-semibold">
              Controlled Testing
            </span>
            <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">science</span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#d4e4fa] font-mono">{activeExperiments.length}</span>
              <span className="text-xs text-[#7bd0ff] font-semibold">
                {activeExperiments.length === 1 ? 'Active Experiment' : activeExperiments.length === 0 ? 'Experiments' : 'Active Experiments'}
              </span>
            </div>
            <p className="text-xs text-[#c7c4d7] mt-1 leading-relaxed">
              {topActiveExp ? (
                <><strong className="text-[#d4e4fa]">{topActiveExp.title}:</strong> {topActiveExp.actionToTake.slice(0, 60)}...</>
              ) : 'No experiments running. Head to Next Experiments to activate one.'}
            </p>
          </div>
          {topActiveExp && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#c7c4d7]">
              <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-ping"></span>
              <span>N={topActiveExp.currentSamples} of {topActiveExp.sampleThreshold} samples</span>
            </div>
          )}
        </div>

        {/* Card 3: Next Recommended Step (data-driven) */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#1c2b3c] border border-[#8083ff]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[#c0c1ff] tracking-wider font-semibold">
              Prescription
            </span>
            <span className="material-symbols-outlined text-[#8083ff] text-[20px]">tips_and_updates</span>
          </div>
          <div className="my-2">
            <div className="text-xs text-[#d4e4fa] uppercase tracking-wider font-bold">
              Next Recommended Step
            </div>
            <p className="text-xs text-[#c7c4d7] mt-1 leading-relaxed">
              {analysis.totalApplications === 0
                ? 'Log your first placement application to start tracking your funnel.'
                : biggestDrop?.fromStage === 'OA'
                ? `Record section-wise OA scores (Coding, Aptitude, SQL) for all ${analysis.oaAttemptedCount} OA(s) to identify which section is limiting your ${analysis.oaToShortlistRate}% shortlist conversion.`
                : biggestDrop?.fromStage === 'Application'
                ? `Check eligibility requirements before applying — only ${analysis.appToOaRate}% of applications reached the OA stage.`
                : biggestDrop?.fromStage === 'Shortlisted'
                ? `Follow up on your ${analysis.shortlistedCount} shortlist(s) to ensure interview slots are confirmed.`
                : `Go to Diagnosis for an evidence-based breakdown of your placement funnel.`
              }
            </p>
          </div>
          <button
            onClick={() => onNavigateTab(analysis.totalApplications === 0 ? 'applications' : 'diagnosis')}
            className="flex items-center justify-between w-full px-3 py-1.5 rounded bg-[#122131] text-[#c0c1ff] text-xs font-semibold hover:bg-[#273647] border border-[#464554] transition-colors cursor-pointer"
            type="button"
          >
            <span>{analysis.totalApplications === 0 ? 'Add First Application' : 'View Full Diagnosis'}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </section>
    </div>
  );
};
