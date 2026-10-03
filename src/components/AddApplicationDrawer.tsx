import React, { useState, useEffect } from 'react';
import { Application } from '../types/placement';

interface AddApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Application) => void;
  editingApp?: Application | null;
}

export const AddApplicationDrawer: React.FC<AddApplicationDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingApp,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [roleTrack, setRoleTrack] = useState<'SDE' | 'Analyst' | 'Quant' | 'Core' | 'Product' | 'Other'>('SDE');
  const [tier, setTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3' | 'Startup' | 'Mass'>('Tier 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [driveClassification, setDriveClassification] = useState<'On-Campus Day 1' | 'On-Campus Day 2' | 'Off-Campus Referral' | 'Direct Career Portal'>('On-Campus Day 1');

  // Eligibility
  const [cutoffCgpa, setCutoffCgpa] = useState<number>(7.5);
  const [candidateCgpa, setCandidateCgpa] = useState<number>(9.2);
  const [branchMatched, setBranchMatched] = useState<boolean>(true);
  const [zeroBacklogs, setZeroBacklogs] = useState<boolean>(true);
  const [bondTerms, setBondTerms] = useState<boolean>(true);

  // Assessment
  const [oaAttempted, setOaAttempted] = useState<boolean>(true);
  const [codingScore, setCodingScore] = useState<string>('2/2 (100%)');
  const [aptitudeScore, setAptitudeScore] = useState<string>('85%');
  const [sqlScore, setSqlScore] = useState<string>('10/10');
  const [csScore, setCsScore] = useState<string>('80%');
  const [oaNotes, setOaNotes] = useState<string>('');

  // Outcomes
  const [shortlistStatus, setShortlistStatus] = useState<'yes' | 'no' | 'pending'>('no');
  const [interviewDepth, setInterviewDepth] = useState<number>(0);
  const [finalOutcome, setFinalOutcome] = useState<'yes' | 'no' | 'pending'>('no');

  // Evidence
  const [jdText, setJdText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [evidenceTag, setEvidenceTag] = useState<string>('Scorecard');

  useEffect(() => {
    if (editingApp) {
      setCompany(editingApp.company);
      setRole(editingApp.role);
      setRoleTrack(editingApp.roleTrack || 'SDE');
      setTier(editingApp.tier || 'Tier 1');
      setDate(editingApp.date || new Date().toISOString().split('T')[0]);
      setDriveClassification(editingApp.driveClassification || 'On-Campus Day 1');
      setCutoffCgpa(editingApp.cgpaRequirement ?? 7.5);
      setCandidateCgpa(editingApp.candidateCgpa ?? 9.2);
      setBranchMatched(editingApp.branchEligible ?? true);
      setZeroBacklogs(editingApp.zeroBacklogs ?? true);
      setBondTerms(editingApp.bondTermsAccepted ?? true);
      setOaAttempted(editingApp.oaAttempted ?? true);
      setCodingScore(editingApp.codingScore || '');
      setAptitudeScore(editingApp.aptitudeScore || '');
      setSqlScore(editingApp.sqlScore || '');
      setCsScore(editingApp.csScore || '');
      setShortlistStatus(editingApp.shortlisted);
      setInterviewDepth(editingApp.interviewRoundsCompleted ?? (editingApp.interview === 'yes' ? 1 : 0));
      setFinalOutcome(editingApp.offer);
      setJdText(editingApp.jdText || '');
      setNotes(editingApp.notes || '');
    } else {
      setCompany('');
      setRole('');
      setRoleTrack('SDE');
      setTier('Tier 1');
      setDate(new Date().toISOString().split('T')[0]);
      setDriveClassification('On-Campus Day 1');
      setCutoffCgpa(7.5);
      setCandidateCgpa(9.2);
      setBranchMatched(true);
      setZeroBacklogs(true);
      setBondTerms(true);
      setOaAttempted(true);
      setCodingScore('');
      setAptitudeScore('');
      setSqlScore('');
      setCsScore('');
      setOaNotes('');
      setShortlistStatus('no');
      setInterviewDepth(0);
      setFinalOutcome('no');
      setJdText('');
      setNotes('');
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const isEligible = candidateCgpa >= cutoffCgpa && branchMatched && zeroBacklogs;

    let derivedOaScore = '';
    if (oaAttempted) {
      if (codingScore && aptitudeScore) {
        derivedOaScore = `Code: ${codingScore}, Apt: ${aptitudeScore}`;
      } else if (codingScore) {
        derivedOaScore = codingScore;
      } else if (aptitudeScore) {
        derivedOaScore = `Aptitude: ${aptitudeScore}`;
      } else {
        derivedOaScore = 'Attempted';
      }
    }

    const application: Application = {
      id: editingApp ? editingApp.id : `app-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      roleTrack,
      tier,
      date,
      driveClassification,
      eligible: isEligible,
      cgpaRequirement: cutoffCgpa,
      candidateCgpa,
      branchEligible: branchMatched,
      zeroBacklogs,
      bondTermsAccepted: bondTerms,
      oaAttempted,
      oaScore: derivedOaScore,
      codingScore: codingScore || undefined,
      aptitudeScore: aptitudeScore || undefined,
      sqlScore: sqlScore || undefined,
      csScore: csScore || undefined,
      oaStatusNote: oaNotes || undefined,
      shortlisted: shortlistStatus,
      interview: interviewDepth > 0 ? 'yes' : 'no',
      interviewRoundsCompleted: interviewDepth,
      offer: finalOutcome,
      jdText: jdText || undefined,
      notes: notes || undefined,
      evidenceTags: [evidenceTag, 'Telemetry'].filter(Boolean),
    };

    onSave(application);
    onClose();
  };

  const cgpaMargin = (candidateCgpa - cutoffCgpa).toFixed(1);
  const isCgpaPassing = candidateCgpa >= cutoffCgpa;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#010f1f]/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl bg-[#0d1c2d] border-l border-[#273647] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#122131] border-b border-[#273647] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#8083ff] text-[#0d0096] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#d4e4fa]">
                {editingApp ? 'Edit Application Telemetry' : 'Quick Log: Add Application'}
              </h2>
              <p className="text-xs text-[#c7c4d7]">
                Synchronize live placement checkpoint to diagnostic telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] flex items-center justify-center transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Section 01 */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7bd0ff]">01</span>
                <h3 className="font-semibold text-sm text-[#d4e4fa]">
                  Company & Role Identification
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#122131] text-[#c7c4d7]">
                Metadata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7] uppercase">Company Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Uber Technologies, Microsoft"
                  className="w-full bg-[#122131] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7] uppercase">Role Track *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend SDE, Tech Analyst"
                  className="w-full bg-[#122131] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7] uppercase">Application Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7] uppercase">Drive Classification</label>
                <select
                  value={driveClassification}
                  onChange={(e) => setDriveClassification(e.target.value as any)}
                  className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none cursor-pointer"
                >
                  <option value="On-Campus Day 1">On-Campus Day 1</option>
                  <option value="On-Campus Day 2">On-Campus Day 2</option>
                  <option value="Off-Campus Referral">Off-Campus Referral</option>
                  <option value="Direct Career Portal">Direct Career Portal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7] uppercase">Tier Archetype</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none cursor-pointer"
                >
                  <option value="Tier 1">Tier 1 Product</option>
                  <option value="Tier 2">Tier 2 Consulting/IT</option>
                  <option value="Tier 3">Tier 3 Core</option>
                  <option value="Startup">High-Growth Startup</option>
                  <option value="Mass">Mass Recruiter</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 02 */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7bd0ff]">02</span>
                <h3 className="font-semibold text-sm text-[#d4e4fa]">Eligibility Criteria</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#122131] text-[#c7c4d7]">
                Baseline Gate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7]">Cutoff CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={cutoffCgpa}
                  onChange={(e) => setCutoffCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#122131] text-[#d4e4fa] text-sm px-3 py-2 rounded-xl border border-[#273647] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#c7c4d7]">Candidate CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={candidateCgpa}
                  onChange={(e) => setCandidateCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#122131] text-[#d4e4fa] text-sm px-3 py-2 rounded-xl border border-[#273647] outline-none"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div
                  className={`h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold ${
                    isCgpaPassing
                      ? 'bg-[#00885d]/20 text-[#4edea3] border border-[#00885d]/40'
                      : 'bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isCgpaPassing ? 'verified' : 'cancel'}
                  </span>
                  <span>
                    {isCgpaPassing ? `Eligible (+${cgpaMargin} margin)` : `Cutoff missed (${cgpaMargin})`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={branchMatched}
                  onChange={(e) => setBranchMatched(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8083ff] bg-[#122131] border-[#273647]"
                />
                <span className="text-xs text-[#d4e4fa]">CSE/IT Branch Matched</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={zeroBacklogs}
                  onChange={(e) => setZeroBacklogs(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8083ff] bg-[#122131] border-[#273647]"
                />
                <span className="text-xs text-[#d4e4fa]">Zero Active Backlogs Cleared</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bondTerms}
                  onChange={(e) => setBondTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8083ff] bg-[#122131] border-[#273647]"
                />
                <span className="text-xs text-[#d4e4fa]">Bond Terms Accepted</span>
              </label>
            </div>
          </section>

          {/* Section 03 */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7bd0ff]">03</span>
                <h3 className="font-semibold text-sm text-[#d4e4fa]">Assessment Telemetry</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#122131] text-[#c7c4d7]">
                Performance
              </span>
            </div>

            <div className="flex items-center gap-4 bg-[#122131] p-3 rounded-xl border border-[#273647]">
              <span className="text-xs font-semibold text-[#d4e4fa]">OA Attempted?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOaAttempted(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    oaAttempted
                      ? 'bg-[#8083ff] text-[#0d0096]'
                      : 'bg-[#1c2b3c] text-[#c7c4d7] hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setOaAttempted(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    !oaAttempted
                      ? 'bg-[#8083ff] text-[#0d0096]'
                      : 'bg-[#1c2b3c] text-[#c7c4d7] hover:text-white'
                  }`}
                >
                  No / Direct
                </button>
              </div>
            </div>

            {oaAttempted && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono text-[#c7c4d7]">Coding Score</label>
                  <input
                    type="text"
                    value={codingScore}
                    onChange={(e) => setCodingScore(e.target.value)}
                    placeholder="e.g. 2/2 or 100%"
                    className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono text-[#c7c4d7]">Aptitude Score</label>
                  <input
                    type="text"
                    value={aptitudeScore}
                    onChange={(e) => setAptitudeScore(e.target.value)}
                    placeholder="e.g. 85% or 42%"
                    className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono text-[#c7c4d7]">SQL / Core CS</label>
                  <input
                    type="text"
                    value={sqlScore}
                    onChange={(e) => setSqlScore(e.target.value)}
                    placeholder="e.g. 10/10 or 50%"
                    className="w-full bg-[#122131] text-[#d4e4fa] text-xs px-3 py-2 rounded-xl border border-[#273647] outline-none"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Section 04 */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7bd0ff]">04</span>
                <h3 className="font-semibold text-sm text-[#d4e4fa]">Outcome Checkpoints</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#122131] text-[#c7c4d7]">
                Funnel Stage
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#122131] p-3 rounded-xl border border-[#273647] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#c7c4d7]">OA Shortlist</span>
                <select
                  value={shortlistStatus}
                  onChange={(e) => setShortlistStatus(e.target.value as any)}
                  className="bg-[#1c2b3c] text-[#d4e4fa] text-xs px-2.5 py-1.5 rounded-lg border border-[#464554] outline-none cursor-pointer"
                >
                  <option value="no">Rejected</option>
                  <option value="yes">Shortlisted</option>
                  <option value="pending">Awaiting result</option>
                </select>
              </div>

              <div className="bg-[#122131] p-3 rounded-xl border border-[#273647] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#c7c4d7]">Interview Depth</span>
                <select
                  value={interviewDepth}
                  onChange={(e) => setInterviewDepth(parseInt(e.target.value) || 0)}
                  className="bg-[#1c2b3c] text-[#d4e4fa] text-xs px-2.5 py-1.5 rounded-lg border border-[#464554] outline-none cursor-pointer"
                >
                  <option value={0}>0 Rounds (OA only)</option>
                  <option value={1}>1 Tech Round</option>
                  <option value={2}>2 Tech Rounds</option>
                  <option value={3}>Tech + Final HR</option>
                </select>
              </div>

              <div className="bg-[#122131] p-3 rounded-xl border border-[#273647] flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#c7c4d7]">Final Outcome</span>
                <select
                  value={finalOutcome}
                  onChange={(e) => setFinalOutcome(e.target.value as any)}
                  className="bg-[#1c2b3c] text-[#d4e4fa] text-xs px-2.5 py-1.5 rounded-lg border border-[#464554] outline-none cursor-pointer"
                >
                  <option value="no">Rejected</option>
                  <option value="yes">Offer Extended 🎉</option>
                  <option value="pending">In Progress / Review</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 05 */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#1c2b3c]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7bd0ff]">05</span>
                <h3 className="font-semibold text-sm text-[#d4e4fa]">Evidence Vault & Notes</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#122131] text-[#c7c4d7]">
                Ground Truth
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-[#c7c4d7]">Observations or Recruiter Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cutoff was 88%, DSA passed 100%, Aptitude timed out..."
                className="w-full bg-[#122131] text-[#d4e4fa] text-xs p-3 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
              />
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[#464554] bg-[#010f1f]/50 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[24px] text-[#8083ff] mb-1">
                cloud_upload
              </span>
              <span className="text-xs font-semibold text-[#d4e4fa]">
                Evidence Attachment (JD, Scorecard, Email)
              </span>
              <span className="text-[11px] text-[#c7c4d7]">
                Attach or reference ground truth evidence for this application
              </span>
              <div className="flex items-center gap-2 mt-2">
                {['Scorecard', 'JD + Mail', 'Interview Invite', 'Test Report'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEvidenceTag(tag)}
                    className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                      evidenceTag === tag
                        ? 'bg-[#8083ff] text-[#0d0096] border-[#8083ff]'
                        : 'bg-[#122131] text-[#c7c4d7] border-[#273647]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-4 border-t border-[#273647] flex items-center justify-end gap-3 mt-auto">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl bg-[#122131] text-[#c7c4d7] hover:text-white border border-[#273647] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#494bd6] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#8083ff]/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">insights</span>
              <span>{editingApp ? 'Update Application' : 'Analyze & Save to Funnel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
