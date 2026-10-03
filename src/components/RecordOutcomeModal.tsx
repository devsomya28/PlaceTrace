import React, { useState } from 'react';
import { Application, Experiment } from '../types/placement';

interface RecordOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  experiments: Experiment[];
  selectedExperimentId?: string;
  onRecordOutcome: (
    appId: string,
    outcome: {
      oaScore?: string;
      shortlisted: 'yes' | 'no' | 'pending';
      interview: 'yes' | 'no' | 'pending';
      offer: 'yes' | 'no' | 'pending';
      notes?: string;
      experimentId?: string;
    }
  ) => void;
}

export const RecordOutcomeModal: React.FC<RecordOutcomeModalProps> = ({
  isOpen,
  onClose,
  applications,
  experiments,
  selectedExperimentId,
  onRecordOutcome,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications[0]?.id || ''
  );
  const [stageOutcome, setStageOutcome] = useState<
    'oa_passed' | 'oa_dropped' | 'shortlist' | 'interview_passed' | 'offer' | 'dropped'
  >('oa_passed');
  const [codingScore, setCodingScore] = useState('2/2 (100%)');
  const [aptitudeScore, setAptitudeScore] = useState('80%');
  const [notes, setNotes] = useState('');
  const [attachedExpId, setAttachedExpId] = useState<string>(
    selectedExperimentId || experiments[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    let shortlisted: 'yes' | 'no' | 'pending' = 'pending';
    let interview: 'yes' | 'no' | 'pending' = 'no';
    let offer: 'yes' | 'no' | 'pending' = 'no';

    if (stageOutcome === 'oa_passed') {
      shortlisted = 'pending';
    } else if (stageOutcome === 'oa_dropped') {
      shortlisted = 'no';
    } else if (stageOutcome === 'shortlist') {
      shortlisted = 'yes';
      interview = 'pending';
    } else if (stageOutcome === 'interview_passed') {
      shortlisted = 'yes';
      interview = 'yes';
    } else if (stageOutcome === 'offer') {
      shortlisted = 'yes';
      interview = 'yes';
      offer = 'yes';
    } else if (stageOutcome === 'dropped') {
      shortlisted = 'no';
    }

    onRecordOutcome(selectedAppId, {
      oaScore: `Code: ${codingScore}, Apt: ${aptitudeScore}`,
      shortlisted,
      interview,
      offer,
      notes: notes || undefined,
      experimentId: attachedExpId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010f1f]/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0d1c2d] border border-[#273647] max-w-lg w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#8083ff]/20 text-[#8083ff] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa]">
                Record Next Outcome
              </h3>
              <p className="text-xs text-[#c7c4d7]">
                Attach fresh assessment or interview evidence to keep experiments calibrated.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#c7c4d7] hover:text-white"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Select Application */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[#c7c4d7] uppercase">Target Application</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full bg-[#122131] text-[#d4e4fa] text-xs p-2.5 rounded-xl border border-[#273647] outline-none cursor-pointer"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} ({app.role}) - Current: {app.shortlisted === 'yes' ? 'Shortlisted' : app.oaAttempted ? 'OA Done' : 'Applied'}
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Outcome */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[#c7c4d7] uppercase">Checkpoint Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'oa_passed', label: 'OA Test Passed' },
                { id: 'shortlist', label: 'Shortlist Confirmed' },
                { id: 'oa_dropped', label: 'OA Dropped / No Shortlist' },
                { id: 'interview_passed', label: 'Tech Round Cleared' },
                { id: 'offer', label: 'Final Offer Extended 🎉' },
                { id: 'dropped', label: 'Process Concluded' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStageOutcome(item.id as any)}
                  className={`p-2.5 rounded-xl text-left font-medium border cursor-pointer transition-colors ${
                    stageOutcome === item.id
                      ? 'bg-[#8083ff]/20 text-[#c0c1ff] border-[#8083ff]'
                      : 'bg-[#122131] text-[#c7c4d7] border-[#273647] hover:border-[#464554]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sectional scores if relevant */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[#c7c4d7]">Coding Test Score</label>
              <input
                type="text"
                value={codingScore}
                onChange={(e) => setCodingScore(e.target.value)}
                placeholder="e.g. 2/2 or 100%"
                className="w-full bg-[#122131] text-[#d4e4fa] p-2 rounded-xl border border-[#273647] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[#c7c4d7]">Aptitude Score</label>
              <input
                type="text"
                value={aptitudeScore}
                onChange={(e) => setAptitudeScore(e.target.value)}
                placeholder="e.g. 80%"
                className="w-full bg-[#122131] text-[#d4e4fa] p-2 rounded-xl border border-[#273647] outline-none"
              />
            </div>
          </div>

          {/* Associate with Active Experiment */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[#c7c4d7] uppercase">Attach to Controlled Experiment</label>
            <select
              value={attachedExpId}
              onChange={(e) => setAttachedExpId(e.target.value)}
              className="w-full bg-[#122131] text-[#d4e4fa] text-xs p-2.5 rounded-xl border border-[#273647] outline-none cursor-pointer"
            >
              <option value="">None / General Drive</option>
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.code}: {exp.title}
                </option>
              ))}
            </select>
          </div>

          {/* Observations */}
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[#c7c4d7]">Outcome Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Coding completed in 35 mins, recruiter email received..."
              className="w-full bg-[#122131] text-[#d4e4fa] p-2 rounded-xl border border-[#273647] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1c2b3c]">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-lg bg-[#122131] text-[#c7c4d7] hover:text-white border border-[#273647] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#8083ff] text-[#0d0096] font-semibold hover:bg-[#c0c1ff] transition-all cursor-pointer shadow-md"
            >
              Update Telemetry & Funnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
