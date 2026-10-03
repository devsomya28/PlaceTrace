import React from 'react';
import { Application } from '../types/placement';

interface ApplicationDetailModalProps {
  application: Application | null;
  onClose: () => void;
  onEdit: (app: Application) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onEdit,
}) => {
  if (!application) return null;

  const isShortlisted = application.shortlisted === 'yes';
  const isOaFail = application.oaAttempted && application.shortlisted === 'no';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010f1f]/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0d1c2d] border border-[#273647] max-w-xl w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#122131] border border-[#273647] flex items-center justify-center text-[#c0c1ff] font-bold text-base">
              {application.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#d4e4fa]">
                  {application.company}
                </h3>
                {application.tier && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2b3c] text-[#7bd0ff] border border-[#273647]">
                    {application.tier}
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#7bd0ff]">
                {application.role} • Applied {application.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#c7c4d7] hover:text-white hover:bg-[#1c2b3c] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Telemetry Stage Indicators */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-lg bg-[#122131] border border-[#273647]">
            <span className="text-[10px] font-mono text-[#c7c4d7] uppercase block">Eligibility Gate</span>
            <span className="text-xs font-semibold text-[#4edea3] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">check</span> Cleared ({application.candidateCgpa || 9.2} CGPA)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#122131] border border-[#273647]">
            <span className="text-[10px] font-mono text-[#c7c4d7] uppercase block">OA Telemetry</span>
            <span className={`text-xs font-semibold mt-0.5 ${application.oaAttempted ? (isOaFail ? 'text-[#ffb4ab]' : 'text-[#4edea3]') : 'text-[#908fa0]'}`}>
              {application.oaAttempted ? (application.oaScore || 'Attempted') : 'Not Triggered'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#122131] border border-[#273647]">
            <span className="text-[10px] font-mono text-[#c7c4d7] uppercase block">Funnel Outcome</span>
            <span className={`text-xs font-semibold mt-0.5 ${isShortlisted ? 'text-[#4edea3]' : isOaFail ? 'text-[#ffb4ab]' : 'text-[#7bd0ff]'}`}>
              {isShortlisted ? 'Shortlisted' : isOaFail ? 'Dropped at OA' : 'In Review'}
            </span>
          </div>
        </div>

        {/* Section Score Breakdown */}
        {application.oaAttempted && (
          <div className="bg-[#122131] p-4 rounded-xl border border-[#273647] flex flex-col gap-2">
            <span className="text-xs font-mono uppercase text-[#7bd0ff] font-semibold">
              Assessment Section Breakdown
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-2 rounded bg-[#0d1c2d] border border-[#1c2b3c]">
                <span className="text-[10px] text-[#c7c4d7] block">Coding DSA</span>
                <span className="font-semibold text-[#4edea3]">
                  {application.codingScore || '100% (Passed)'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0d1c2d] border border-[#1c2b3c]">
                <span className="text-[10px] text-[#c7c4d7] block">Aptitude</span>
                <span className={`font-semibold ${application.aptitudeScore?.includes('Low') || application.aptitudeScore?.includes('42%') ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'}`}>
                  {application.aptitudeScore || 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0d1c2d] border border-[#1c2b3c]">
                <span className="text-[10px] text-[#c7c4d7] block">SQL / DB</span>
                <span className={`font-semibold ${application.sqlScore?.includes('Timed') ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'}`}>
                  {application.sqlScore || 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0d1c2d] border border-[#1c2b3c]">
                <span className="text-[10px] text-[#c7c4d7] block">Core CS</span>
                <span className={`font-semibold ${application.csScore?.includes('Low') ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'}`}>
                  {application.csScore || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empirical Telemetry Notes */}
        <div className="bg-[#122131] p-4 rounded-xl border border-[#273647] flex flex-col gap-2">
          <span className="text-xs font-mono uppercase text-[#c7c4d7]">
            Empirical Telemetry Log & Observations
          </span>
          <p className="text-sm text-[#d4e4fa] leading-relaxed">
            {application.notes || 'No specific telemetry observations logged for this submission.'}
          </p>
        </div>

        {/* Interview Details if applicable */}
        {application.interview === 'yes' && (
          <div className="bg-[#122131] p-4 rounded-xl border border-[#273647] flex flex-col gap-1.5">
            <span className="text-xs font-mono uppercase text-[#4edea3]">
              Interview Telemetry
            </span>
            <p className="text-xs text-[#d4e4fa]">
              {application.interviewNotes || `${application.interviewRoundsCompleted || 1} rounds evaluated.`}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1c2b3c]">
          <button
            onClick={() => {
              onClose();
              onEdit(application);
            }}
            className="px-4 py-2 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Telemetry Record</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-xs font-semibold transition-colors cursor-pointer"
            type="button"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
