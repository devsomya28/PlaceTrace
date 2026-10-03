import React, { useState } from 'react';
import { Application, FunnelAnalysis } from '../types/placement';

interface ApplicationsViewProps {
  applications: Application[];
  analysis: FunnelAnalysis;
  onOpenAddModal: () => void;
  onInspectApplication: (app: Application) => void;
  onDeleteApplication: (id: string) => void;
  onEditApplication: (app: Application) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  analysis,
  onOpenAddModal,
  onInspectApplication,
  onDeleteApplication,
  onEditApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');

  // Filter application items
  const filteredApps = applications.filter((app) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      app.company.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query) ||
      (app.notes && app.notes.toLowerCase().includes(query)) ||
      (app.oaScore && app.oaScore.toLowerCase().includes(query));

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'SDE' && (app.roleTrack === 'SDE' || app.role.toLowerCase().includes('sde') || app.role.toLowerCase().includes('swe'))) ||
      (roleFilter === 'Analyst' && (app.roleTrack === 'Analyst' || app.role.toLowerCase().includes('analyst'))) ||
      (roleFilter === 'Quant' && (app.roleTrack === 'Quant' || app.role.toLowerCase().includes('quant')));

    let matchesStage = true;
    if (stageFilter === 'OA') {
      matchesStage = app.oaAttempted && app.shortlisted === 'no';
    } else if (stageFilter === 'SHORTLIST') {
      matchesStage = app.shortlisted === 'no' && app.oaAttempted;
    } else if (stageFilter === 'INTERVIEW') {
      matchesStage = app.interview === 'yes' && app.offer === 'no';
    } else if (stageFilter === 'OFFER') {
      matchesStage = app.offer === 'yes';
    }

    return matchesSearch && matchesRole && matchesStage;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStageFilter('ALL');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#7bd0ff]">
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            <span className="text-xs uppercase tracking-wider font-mono">
              Telemetry Signal Stream
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d4e4fa] tracking-tight">
            Your placement history
          </h1>
          <p className="text-sm sm:text-base text-[#c7c4d7] max-w-2xl">
            Every application becomes part of your placement feedback loop. Isolate rejection bottlenecks with cold empirical precision.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c2b3c] border border-[#273647]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-mono text-xs text-[#d4e4fa]">
              {applications.length} Traced Nodes
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#010f1f] text-[#c7c4d7]">
              {analysis.offerCount} Offers
            </span>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8083ff] text-[#0d0096] font-semibold text-xs sm:text-sm hover:bg-[#c0c1ff] hover:text-[#1000a9] shadow-lg shadow-[#8083ff]/20 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Add Application</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1c2d] p-4 rounded-xl border border-[#273647] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#c7c4d7] uppercase font-mono">Screening Cleared</span>
            <span className="text-2xl font-bold text-[#d4e4fa] font-mono mt-1">
              {analysis.eligibleApplications} / {analysis.totalApplications}
            </span>
            <span className="text-xs text-[#4edea3] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">check</span> 100% eligibility parity
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00885d]/20 border border-[#00885d]/40 flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined">rule</span>
          </div>
        </div>

        <div className="bg-[#0d1c2d] p-4 rounded-xl border border-[#273647] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#c7c4d7] uppercase font-mono">OA Cleared vs Stalled</span>
            <span className="text-2xl font-bold text-[#d4e4fa] font-mono mt-1">
              {analysis.shortlistedCount} / {analysis.oaAttemptedCount}
            </span>
            <span className="text-xs text-[#ffb4ab] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">priority_high</span>{' '}
              {analysis.oaAttemptedCount - analysis.shortlistedCount} test-level drops
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab]">
            <span className="material-symbols-outlined">terminal</span>
          </div>
        </div>

        <div className="bg-[#0d1c2d] p-4 rounded-xl border border-[#273647] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#c7c4d7] uppercase font-mono">Interview Conversion</span>
            <span className="text-2xl font-bold text-[#d4e4fa] font-mono mt-1">
              {analysis.interviewCount} / {analysis.shortlistedCount || 1}
            </span>
            <span className="text-xs text-[#c7c4d7] mt-0.5">
              {analysis.shortlistToInterviewRate}% flow to rounds
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#122131] border border-[#273647] flex items-center justify-center text-[#8083ff]">
            <span className="material-symbols-outlined">psychology</span>
          </div>
        </div>

        <div className="bg-[#0d1c2d] p-4 rounded-xl border border-[#273647] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-[#c7c4d7] uppercase font-mono">Observed Hypothesis</span>
            <span className="text-base font-semibold text-[#7bd0ff] mt-1">Aptitude & Final Pool</span>
            <span className="text-xs text-[#c7c4d7] mt-0.5">Sectional cutoff variance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#1c2b3c] border border-[#464554] flex items-center justify-center text-[#4edea3]">
            <span className="material-symbols-outlined">biotech</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1c2d] p-3 rounded-2xl border border-[#273647] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#908fa0] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter company, role, assessment signals..."
            className="w-full bg-[#010f1f] text-[#d4e4fa] text-sm pl-11 pr-4 py-2.5 rounded-xl border border-[#1c2b3c] outline-none focus:border-[#8083ff] transition-colors placeholder:text-[#908fa0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#010f1f] px-3 py-1.5 rounded-xl border border-[#1c2b3c]">
            <span className="text-[11px] font-mono text-[#908fa0] uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-[#d4e4fa] text-xs font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-[#122131]">All Roles</option>
              <option value="SDE" className="bg-[#122131]">SDE / Core Dev</option>
              <option value="Analyst" className="bg-[#122131]">Analyst / Consulting</option>
              <option value="Quant" className="bg-[#122131]">Quant / Systems</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#010f1f] px-3 py-1.5 rounded-xl border border-[#1c2b3c]">
            <span className="text-[11px] font-mono text-[#908fa0] uppercase">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent text-[#d4e4fa] text-xs font-semibold outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-[#122131]">All Stages</option>
              <option value="OA" className="bg-[#122131]">Rejected at OA</option>
              <option value="SHORTLIST" className="bg-[#122131]">Shortlist Stalled</option>
              <option value="INTERVIEW" className="bg-[#122131]">Interviewed & Dropped</option>
              <option value="OFFER" className="bg-[#122131]">Offer Extended</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            title="Reset Filters"
            type="button"
            className="p-2.5 rounded-xl bg-[#1c2b3c] text-[#c7c4d7] hover:text-white hover:bg-[#273647] border border-[#273647] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-x-auto rounded-2xl bg-[#0d1c2d] border border-[#273647] shadow-xl">
        <table className="w-full text-left min-w-[1040px]">
          <thead>
            <tr className="bg-[#122131] text-[#c7c4d7] font-semibold text-xs uppercase tracking-wider border-b border-[#273647]">
              <th className="py-3 px-5">Company</th>
              <th className="py-3 px-4">Role Track</th>
              <th className="py-3 px-3 text-center">Eligible</th>
              <th className="py-3 px-4">OA Telemetry</th>
              <th className="py-3 px-4">Shortlisted</th>
              <th className="py-3 px-4">Interview Phase</th>
              <th className="py-3 px-3 text-center">Offer</th>
              <th className="py-3 px-4">Evidence Vault</th>
              <th className="py-3 px-5 text-right">Diagnosis Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-[#d4e4fa] divide-y divide-[#1c2b3c]">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#c7c4d7]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-[#908fa0]">filter_list_off</span>
                    <p className="text-base font-semibold">No applications match the current filter.</p>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-[#8083ff] hover:underline"
                    >
                      Clear search filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredApps.map((app, index) => {
                const isShortlisted = app.shortlisted === 'yes';
                const isOaFail = app.oaAttempted && app.shortlisted === 'no';
                const isRowEven = index % 2 === 1;

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-[#1c2b3c]/60 transition-colors group ${
                      isRowEven ? 'bg-[#010f1f]/30' : ''
                    }`}
                  >
                    {/* Company */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#122131] border border-[#273647] flex items-center justify-center text-[#c0c1ff] font-bold text-xs shrink-0">
                          {app.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#d4e4fa] group-hover:text-white transition-colors">
                              {app.company}
                            </span>
                            {app.tier && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c2b3c] text-[#7bd0ff] border border-[#273647]">
                                {app.tier}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#c7c4d7]">
                            Applied {app.date}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Track */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-[#122131] text-[#d4e4fa] border border-[#273647]">
                        {app.role}
                      </span>
                    </td>

                    {/* Eligible */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/30"
                        title="CGPA and branch eligibility confirmed"
                      >
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>{app.candidateCgpa || '9.2'}</span>
                      </span>
                    </td>

                    {/* OA Telemetry */}
                    <td className="py-3.5 px-4">
                      {app.oaAttempted ? (
                        <div className="flex flex-col">
                          <span
                            className={`font-mono text-xs flex items-center gap-1 font-semibold ${
                              app.oaScore?.includes('Timeout') || app.oaScore?.includes('Low')
                                ? 'text-[#ffb4ab]'
                                : 'text-[#4edea3]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                app.oaScore?.includes('Timeout') || app.oaScore?.includes('Low')
                                  ? 'bg-[#ffb4ab]'
                                  : 'bg-[#4edea3]'
                              }`}
                            ></span>
                            {app.oaScore || 'Attempted'}
                          </span>
                          <span className="text-[11px] text-[#c7c4d7]">
                            {app.codingScore ? `Coding: ${app.codingScore}` : 'Sectionals recorded'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#908fa0] italic">
                          {app.oaStatusNote || 'No OA invite'}
                        </span>
                      )}
                    </td>

                    {/* Shortlisted */}
                    <td className="py-3.5 px-4">
                      {isShortlisted ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/30">
                          Approved
                        </span>
                      ) : isOaFail ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
                            <span className="text-xs text-[#ffb4ab] font-medium">No Shortlist</span>
                          </div>
                          <span className="text-[10px] text-[#c7c4d7]">Filtered at cutoff</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#7bd0ff]">Pending</span>
                      )}
                    </td>

                    {/* Interview Phase */}
                    <td className="py-3.5 px-4">
                      {app.interview === 'yes' ? (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-[#d4e4fa] font-medium">
                            {app.interviewRoundsCompleted ? `${app.interviewRoundsCompleted} Tech Rounds` : 'Interviewed'}
                          </span>
                          <span className="text-[11px] text-[#ffb4ab]">
                            {app.offer === 'no' ? 'Dropped in Round' : 'Under Review'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#464554] font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Offer */}
                    <td className="py-3.5 px-3 text-center">
                      {app.offer === 'yes' ? (
                        <span className="material-symbols-outlined text-[#4edea3] text-[18px]">check_circle</span>
                      ) : app.interview === 'yes' && app.offer === 'no' ? (
                        <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">close</span>
                      ) : (
                        <span className="material-symbols-outlined text-[#464554] text-[18px]">remove</span>
                      )}
                    </td>

                    {/* Evidence Vault */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {(app.evidenceTags && app.evidenceTags.length > 0
                          ? app.evidenceTags
                          : ['Notes']
                        ).map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => onInspectApplication(app)}
                            className="px-2 py-0.5 rounded bg-[#122131] hover:bg-[#1c2b3c] text-[#c7c4d7] hover:text-white text-[11px] flex items-center gap-1 border border-[#273647] transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[13px]">attachment</span>
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspectApplication(app)}
                          className="px-3 py-1 rounded-lg bg-[#1c2b3c] hover:bg-[#8083ff] text-[#d4e4fa] hover:text-[#0d0096] text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer border border-[#273647]"
                          type="button"
                        >
                          <span>Breakdown</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                        <button
                          onClick={() => onEditApplication(app)}
                          title="Edit application"
                          className="p-1 rounded text-[#c7c4d7] hover:text-white hover:bg-[#1c2b3c] transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          title="Delete record"
                          className="p-1 rounded text-[#ffb4ab]/70 hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[#c7c4d7] text-xs gap-3 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span>Verified telemetry recorded</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
            <span>Diagnostic bottleneck point</span>
          </span>
        </div>
        <div>
          Showing {filteredApps.length} of {applications.length} registered placements
        </div>
      </div>
    </div>
  );
};
