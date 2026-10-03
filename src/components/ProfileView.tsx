import React, { useState } from 'react';
import { StudentProfile, FunnelAnalysis } from '../types/placement';

interface ProfileViewProps {
  profile: StudentProfile;
  analysis: FunnelAnalysis;
  onSaveProfile: (profile: StudentProfile) => void;
  onResetToDemo: () => void;
  onExportJson: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  analysis,
  onSaveProfile,
  onResetToDemo,
  onExportJson,
}) => {
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college);
  const [branch, setBranch] = useState(profile.branch);
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear);
  const [cgpa, setCgpa] = useState<number>(profile.cgpa);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [collegeTier, setCollegeTier] = useState(profile.collegeTier);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState(profile.resumeText);
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...profile,
      name,
      college,
      branch,
      graduationYear,
      cgpa,
      targetRole,
      collegeTier,
      skills,
      resumeText,
    };
    onSaveProfile(updated);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#273647]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#7bd0ff] uppercase mb-1">
            <span className="material-symbols-outlined text-[16px]">account_circle</span>
            <span>Candidate Profile & Baseline Credentials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#d4e4fa] tracking-tight">
            Student Placement Profile
          </h1>
          <p className="text-sm text-[#c7c4d7] mt-0.5">
            Your telemetry profile is used to calculate eligibility margin and sectional baselines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onResetToDemo}
            className="px-3.5 py-1.5 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-[#273647] text-xs font-semibold text-[#c7c4d7] hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            Reset Demo Data
          </button>
          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] border border-[#273647] text-xs font-semibold text-[#d4e4fa] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-3 rounded-xl bg-[#00885d]/30 border border-[#00885d]/50 text-[#4edea3] text-xs flex items-center justify-between animate-in fade-in">
          <span>Profile configuration saved successfully to local telemetry!</span>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        </div>
      )}

      {/* Placement Summary Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#273647]">
          <span className="text-[11px] font-mono text-[#c7c4d7] uppercase">Applications</span>
          <div className="text-2xl font-bold font-mono text-[#d4e4fa] mt-0.5">
            {analysis.totalApplications}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#273647]">
          <span className="text-[11px] font-mono text-[#c7c4d7] uppercase">OAs Attempted</span>
          <div className="text-2xl font-bold font-mono text-[#7bd0ff] mt-0.5">
            {analysis.oaAttemptedCount}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#273647]">
          <span className="text-[11px] font-mono text-[#c7c4d7] uppercase">Shortlisted</span>
          <div className="text-2xl font-bold font-mono text-[#ffb4ab] mt-0.5">
            {analysis.shortlistedCount}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#273647]">
          <span className="text-[11px] font-mono text-[#c7c4d7] uppercase">Interviews</span>
          <div className="text-2xl font-bold font-mono text-[#4edea3] mt-0.5">
            {analysis.interviewCount}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0d1c2d] border border-[#273647] col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono text-[#c7c4d7] uppercase">Offers</span>
          <div className="text-2xl font-bold font-mono text-[#c0c1ff] mt-0.5">
            {analysis.offerCount}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Primary Details */}
        <div className="lg:col-span-8 flex flex-col gap-6 bg-[#122131] border border-[#273647] rounded-xl p-6 shadow-md">
          <h2 className="text-base font-semibold text-[#d4e4fa] pb-2 border-b border-[#1c2b3c]">
            Academic & Identification Records
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">College / Institute</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none focus:border-[#8083ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">Graduation Year</label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                value={cgpa}
                onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">Target Role Track</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#c7c4d7]">College Tier Benchmark</label>
              <select
                value={collegeTier}
                onChange={(e) => setCollegeTier(e.target.value)}
                className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-sm px-3.5 py-2 rounded-xl border border-[#273647] outline-none cursor-pointer"
              >
                <option value="Tier-1 Engineering">Tier-1 Engineering (IIT/NIT/BITS)</option>
                <option value="Tier-2 Engineering">Tier-2 Engineering (State Govt/Top Private)</option>
                <option value="Tier-3 Engineering">Tier-3 Engineering</option>
              </select>
            </div>
          </div>

          {/* Skills Management */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs font-mono text-[#c7c4d7]">Core Skills & Competencies</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0d1c2d] border border-[#273647] text-xs text-[#d4e4fa]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-[#908fa0] hover:text-[#ffb4ab] transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill (e.g. Distributed Systems, Kafka)..."
                className="flex-1 bg-[#0d1c2d] text-[#d4e4fa] text-xs px-3 py-1.5 rounded-lg border border-[#273647] outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#c0c1ff] text-xs font-semibold cursor-pointer border border-[#273647]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Resume text */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-xs font-mono text-[#c7c4d7]">
              Resume Bio & Algorithmic Highlights
            </label>
            <textarea
              rows={3}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-[#0d1c2d] text-[#d4e4fa] text-xs p-3 rounded-xl border border-[#273647] outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8083ff] to-[#494bd6] text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Experience & Projects */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#122131] border border-[#273647] rounded-xl p-5 shadow-md flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[#d4e4fa] pb-2 border-b border-[#1c2b3c]">
              Key Projects on File
            </h3>
            <div className="space-y-2.5">
              {profile.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0d1c2d] border border-[#1c2b3c] text-xs text-[#d4e4fa] flex items-start gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#7bd0ff] shrink-0 mt-0.5">
                    code
                  </span>
                  <span>{proj}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#122131] border border-[#273647] rounded-xl p-5 shadow-md flex flex-col gap-3">
            <h3 className="font-semibold text-sm text-[#d4e4fa] pb-2 border-b border-[#1c2b3c]">
              Internship History
            </h3>
            <div className="space-y-2.5">
              {profile.internships.map((intern, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0d1c2d] border border-[#1c2b3c] text-xs text-[#d4e4fa] flex items-start gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#4edea3] shrink-0 mt-0.5">
                    work
                  </span>
                  <span className="leading-relaxed">{intern}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
