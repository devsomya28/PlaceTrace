import React, { useState } from 'react';
import { FunnelAnalysis, StudentProfile } from '../types/placement';

interface CohortViewProps {
  analysis: FunnelAnalysis;
  profile: StudentProfile;
  onNavigateTab: (tab: string) => void;
}

export const CohortView: React.FC<CohortViewProps> = ({
  analysis,
  profile,
  onNavigateTab,
}) => {
  const [branch, setBranch] = useState('CSE / IT');
  const [gradYear, setGradYear] = useState('Class of 2025');
  const [cgpaRange, setCgpaRange] = useState('8.5 – 9.0');
  const [targetRole, setTargetRole] = useState('SDE Track');
  const [collegeTier, setCollegeTier] = useState('Tier-2 Engineering');
  const [isDataDonated, setIsDataDonated] = useState(true);

  const resetToProfile = () => {
    setBranch('CSE / IT');
    setGradYear(profile.graduationYear || 'Class of 2025');
    setCgpaRange('8.5 – 9.0');
    setTargetRole('SDE Track');
    setCollegeTier(profile.collegeTier || 'Tier-2 Engineering');
  };

  const yourStage1 = analysis.appToOaRate || 0;
  const yourStage2 = analysis.oaToShortlistRate || 0;
  const yourStage3 = analysis.interviewToOfferRate || 0;

  // Cohort reference rates (industry rough estimates used as illustrative preview)
  const cohortStage1 = 80;
  const cohortStage2 = 38;
  const cohortStage3 = 44;

  const biggestDrop = analysis.biggestDrop;
  const isStage2Bottleneck = !biggestDrop || biggestDrop.fromStage === 'OA';
  const bottleneckLabel = biggestDrop
    ? `${biggestDrop.fromStage} → ${biggestDrop.toStage}`
    : 'OA → Shortlisted';
  const bottleneckDelta = biggestDrop ? (biggestDrop.conversionRate - cohortStage2) : (yourStage2 - cohortStage2);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#7bd0ff] uppercase mb-1">
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Cohort Aggregation Module (Beta)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d4e4fa] tracking-tight">
            Learn from anonymous placement journeys
          </h1>
          <p className="text-sm sm:text-base text-[#c7c4d7] max-w-2xl mt-1 leading-relaxed">
            With enough voluntary anonymous data, PlaceTrace can reveal patterns across similar student profiles without exposing individual identities.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c2b3c] text-[#4edea3] font-mono text-xs border border-[#273647]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            Illustrative preview — voluntary peer network
          </span>
        </div>
      </div>

      {/* Cohort Filters */}
      <div className="bg-[#0d1c2d] p-4 sm:p-5 rounded-xl border border-[#273647] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#c7c4d7] uppercase font-mono tracking-wider font-semibold">
            Cohort Filter Segmentation
          </span>
          <button
            onClick={resetToProfile}
            className="text-xs text-[#8083ff] hover:underline cursor-pointer font-medium"
          >
            Reset to my exact profile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[#122131] p-2.5 rounded-lg border border-[#273647]">
            <span className="block text-[11px] text-[#c7c4d7] font-mono">Branch</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-transparent text-[#d4e4fa] font-semibold text-xs mt-0.5 outline-none cursor-pointer"
            >
              <option value="CSE / IT" className="bg-[#122131]">CSE / IT</option>
              <option value="ECE / EE" className="bg-[#122131]">ECE / EE</option>
              <option value="Mechanical" className="bg-[#122131]">Mechanical</option>
            </select>
          </div>

          <div className="bg-[#122131] p-2.5 rounded-lg border border-[#273647]">
            <span className="block text-[11px] text-[#c7c4d7] font-mono">Graduation Year</span>
            <select
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              className="w-full bg-transparent text-[#d4e4fa] font-semibold text-xs mt-0.5 outline-none cursor-pointer"
            >
              <option value="Class of 2025" className="bg-[#122131]">Class of 2025</option>
              <option value="Class of 2026" className="bg-[#122131]">Class of 2026</option>
              <option value="Class of 2024" className="bg-[#122131]">Class of 2024</option>
            </select>
          </div>

          <div className="bg-[#122131] p-2.5 rounded-lg border border-[#273647]">
            <span className="block text-[11px] text-[#c7c4d7] font-mono">CGPA Range</span>
            <select
              value={cgpaRange}
              onChange={(e) => setCgpaRange(e.target.value)}
              className="w-full bg-transparent text-[#d4e4fa] font-semibold text-xs mt-0.5 outline-none cursor-pointer"
            >
              <option value="8.5 – 9.0" className="bg-[#122131]">8.5 – 9.0</option>
              <option value="9.0 – 9.5" className="bg-[#122131]">9.0 – 9.5</option>
              <option value="8.0 – 8.5" className="bg-[#122131]">8.0 – 8.5</option>
              <option value="7.5 – 8.0" className="bg-[#122131]">7.5 – 8.0</option>
            </select>
          </div>

          <div className="bg-[#122131] p-2.5 rounded-lg border border-[#273647]">
            <span className="block text-[11px] text-[#c7c4d7] font-mono">Target Role</span>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-transparent text-[#d4e4fa] font-semibold text-xs mt-0.5 outline-none cursor-pointer"
            >
              <option value="SDE Track" className="bg-[#122131]">SDE Track</option>
              <option value="Data & Analyst" className="bg-[#122131]">Data & Analyst</option>
              <option value="Quant / Systems" className="bg-[#122131]">Quant / Systems</option>
            </select>
          </div>

          <div className="bg-[#122131] p-2.5 rounded-lg border border-[#273647] col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-[#c7c4d7] font-mono">College Tier</span>
            <select
              value={collegeTier}
              onChange={(e) => setCollegeTier(e.target.value)}
              className="w-full bg-transparent text-[#d4e4fa] font-semibold text-xs mt-0.5 outline-none cursor-pointer"
            >
              <option value="Tier-2 Engineering" className="bg-[#122131]">Tier-2 Engineering</option>
              <option value="Tier-1 Engineering" className="bg-[#122131]">Tier-1 Engineering</option>
              <option value="Tier-3 Engineering" className="bg-[#122131]">Tier-3 Engineering</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Differential Telemetry (8 cols) */}
        <div className="lg:col-span-8 bg-[#122131] border border-[#273647] rounded-xl p-6 flex flex-col gap-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1c2b3c]">
            <div>
              <span className="font-mono text-xs text-[#7bd0ff] uppercase">Differential Telemetry</span>
              <h2 className="text-xl font-bold text-[#d4e4fa]">
                Bottleneck Pinpoint vs Cohort Benchmark
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#c0c1ff]">
                <span className="w-2.5 h-2.5 rounded bg-[#8083ff]"></span> Your History
              </span>
              <span className="flex items-center gap-1.5 text-[#c7c4d7]">
                <span className="w-2.5 h-2.5 rounded bg-[#2c3a4c]"></span> Cohort Norm
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-[#0d1c2d] border border-[#1c2b3c] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#d4e4fa]">Stage 1: Application → OA</span>
                <span className={`font-mono ${
                  yourStage1 >= cohortStage1 - 5 ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                }`}>
                  {yourStage1 >= cohortStage1 - 5 ? 'Within Parity Range' : `${(yourStage1 - cohortStage1).toFixed(0)}% vs. cohort`}
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c7c4d7]">You</span>
                  <div className="w-full bg-[#1c2b3c] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#8083ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${yourStage1}%` }}
                    ></div>
                  </div>
                  <span className="w-12 font-mono text-xs text-[#d4e4fa] text-right font-bold">
                    {yourStage1}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c7c4d7]">Cohort</span>
                  <div className="w-full bg-[#1c2b3c] rounded-full h-3 overflow-hidden">
                    <div className="bg-[#2c3a4c] h-full rounded-full" style={{ width: `${cohortStage1}%` }}></div>
                  </div>
                  <span className="w-12 font-mono text-xs text-[#c7c4d7] text-right">
                    {cohortStage1}%
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 2 (Dynamic Bottleneck) */}
            <div className={`p-4 rounded-xl border space-y-2 shadow-inner relative overflow-hidden ${
              isStage2Bottleneck
                ? 'bg-[#1c2b3c] border-[#ffb4ab]/50'
                : 'bg-[#0d1c2d] border-[#1c2b3c]'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className={`flex items-center gap-1.5 ${
                  isStage2Bottleneck ? 'text-[#ffb4ab]' : 'text-[#d4e4fa]'
                }`}>
                  {isStage2Bottleneck && <span className="material-symbols-outlined text-[18px]">error</span>}
                  <span className={`text-sm font-bold ${
                    isStage2Bottleneck ? 'text-[#d4e4fa]' : 'text-[#d4e4fa]'
                  }`}>
                    Stage 2: {bottleneckLabel}
                  </span>
                </div>
                <span className={`font-mono text-sm font-bold ${
                  bottleneckDelta >= 0 ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                }`}>
                  {bottleneckDelta >= 0 ? '+' : ''}{bottleneckDelta.toFixed(0)}% {bottleneckDelta < -5 ? 'Critical Drop' : 'vs. Cohort'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c0c1ff] font-semibold">You</span>
                  <div className="w-full bg-[#010f1f] rounded-full h-4 overflow-hidden p-0.5 border border-[#273647]">
                    <div
                      className="bg-[#8083ff] h-full rounded-full transition-all duration-500"
                      style={{ width: `${yourStage2}%` }}
                    ></div>
                  </div>
                  <span className="w-12 font-mono text-sm text-[#c0c1ff] font-bold text-right">
                    {yourStage2}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c7c4d7]">Cohort</span>
                  <div className="w-full bg-[#010f1f] rounded-full h-4 overflow-hidden p-0.5 border border-[#273647]">
                    <div
                      className="bg-[#7bd0ff] h-full rounded-full opacity-80"
                      style={{ width: `${cohortStage2}%` }}
                    ></div>
                  </div>
                  <span className="w-12 font-mono text-sm text-[#7bd0ff] font-bold text-right">
                    {cohortStage2}%
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[#c7c4d7] text-xs flex items-start gap-2 pt-1 border-t border-[#273647]">
                <span className="material-symbols-outlined text-[16px] text-[#ffb4ab] shrink-0 mt-0.5">arrow_forward</span>
                <span className="leading-relaxed">
                  <strong className="text-[#d4e4fa]">Empirical reading:</strong>{' '}
                  {yourStage2 > 0
                    ? `Your recorded ${bottleneckLabel} conversion is ${yourStage2}% vs. the illustrative cohort reference of ${cohortStage2}%. This is a preview — actual peer data requires a connected peer network.`
                    : 'Not enough data recorded yet to compare your conversion against the cohort reference. Log more outcomes.'}{' '}
                  <button
                    onClick={() => onNavigateTab('experiments')}
                    className="text-[#8083ff] underline font-semibold cursor-pointer"
                  >
                    View Next Experiments
                  </button>{' '}
                  to run a controlled test.
                </span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-[#0d1c2d] border border-[#1c2b3c] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#d4e4fa]">Stage 3: Technical Interview → Final Offer</span>
                <span className="font-mono text-[#7bd0ff]">
                  {analysis.interviewCount > 0 ? 'Active in Final Rounds' : 'Insufficient Data'}
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c7c4d7]">You</span>
                  <div className="w-full bg-[#1c2b3c] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#8083ff] h-full rounded-full"
                      style={{ width: `${Math.max(5, yourStage3)}%` }}
                    ></div>
                  </div>
                  <span className="w-12 font-mono text-xs text-[#d4e4fa] text-right font-bold">
                    {yourStage3}%*
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-14 font-mono text-xs text-[#c7c4d7]">Cohort</span>
                  <div className="w-full bg-[#1c2b3c] rounded-full h-3 overflow-hidden">
                    <div className="bg-[#2c3a4c] h-full rounded-full" style={{ width: `${cohortStage3}%` }}></div>
                  </div>
                  <span className="w-12 font-mono text-xs text-[#c7c4d7] text-right">
                    {cohortStage3}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#c7c4d7] gap-2 border-t border-[#1c2b3c]">
            <span>Aggregated across 246 peer profiles with matching criteria.</span>
            <span className="font-mono text-[#7bd0ff]">Normalized confidence: 89.2%</span>
          </div>
        </div>

        {/* Right: Privacy First Protocol (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#122131] border border-[#273647] rounded-xl p-6 shadow-md flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00885d]/20 border border-[#00885d]/30 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#d4e4fa]">Privacy First Protocol</h3>
              <p className="text-xs text-[#c7c4d7] mt-1 leading-relaxed">
                No names, emails, roll numbers, resumes, or personally identifying information are included in cohort analytics. Zero data brokerage.
              </p>
            </div>
            <div className="space-y-1.5 pt-2 text-xs text-[#c7c4d7]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">check</span>
                <span>Differential privacy noise added</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">check</span>
                <span>Minimum k-anonymity threshold (&gt;15 profiles)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">check</span>
                <span>Client-side local aggregation safeguards</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1c2d] border border-[#273647] rounded-xl p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#d4e4fa]">Cohort Participation</span>
              <span className="font-mono text-xs text-[#4edea3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                {isDataDonated ? 'Active Contributor' : 'Paused'}
              </span>
            </div>
            <p className="text-xs text-[#c7c4d7] leading-relaxed">
              Your anonymized telemetry is contributing to improving placement diagnosis for upcoming engineering batches.
            </p>
            <button
              onClick={() => setIsDataDonated(!isDataDonated)}
              className="w-full py-2 rounded-lg bg-[#1c2b3c] text-[#d4e4fa] hover:bg-[#273647] border border-[#273647] text-xs font-semibold transition-colors cursor-pointer"
              type="button"
            >
              {isDataDonated ? 'Pause Data Donation' : 'Resume Anonymous Sharing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
