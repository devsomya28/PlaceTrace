export interface Application {
  id: string;
  company: string;
  role: string;
  roleTrack?: 'SDE' | 'Analyst' | 'Quant' | 'Core' | 'Product' | 'Other';
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Startup' | 'Mass';
  date: string; // ISO date string YYYY-MM-DD
  driveClassification?: 'On-Campus Day 1' | 'On-Campus Day 2' | 'Off-Campus Referral' | 'Direct Career Portal';
  
  // Eligibility
  eligible: boolean;
  cgpaRequirement?: number;
  candidateCgpa?: number;
  branchEligible?: boolean;
  zeroBacklogs?: boolean;
  bondTermsAccepted?: boolean;
  eligibilityNotes?: string;

  // Assessment (OA)
  oaAttempted: boolean;
  oaScore?: string; // e.g. "100%", "2/2", "85%"
  codingScore?: string; // e.g. "2/2 (100%)"
  aptitudeScore?: string; // e.g. "54%", "Low", "85%"
  sqlScore?: string; // e.g. "50% (Timed Out)", "10/10"
  csScore?: string; // e.g. "55% (Low Score)"
  oaTimeSpentMinutes?: number;
  oaTimeLimitMinutes?: number;
  oaStatusNote?: string;

  // Outcomes
  shortlisted: 'yes' | 'no' | 'pending';
  interview: 'yes' | 'no' | 'pending';
  interviewRoundsCompleted?: number; // e.g. 0, 1, 2
  interviewNotes?: string;
  offer: 'yes' | 'no' | 'pending';

  // Evidence & Qualitative
  jdText?: string;
  feedback?: string;
  notes?: string;
  evidenceTags?: string[]; // e.g. ["JD", "Scorecard", "Rejection Mail", "Interview Invite"]

  // Experiment association
  experimentId?: string;
  experimentVariant?: string;
}

export interface StudentProfile {
  name: string;
  college: string;
  branch: string;
  graduationYear: string;
  cgpa: number;
  skills: string[];
  projects: string[];
  internships: string[];
  resumeText: string;
  targetRole: string;
  collegeTier: string;
}

export interface FunnelStageMetrics {
  stageNumber: string;
  code: string;
  name: string;
  count: number;
  subtext: string;
  conversionFromPrev: number; // percentage (0 - 100)
  dropFromPrev: number; // percentage (0 - 100)
  overallPercentage: number; // relative to total applications
  isBottleneck?: boolean;
}

export interface FunnelAnalysis {
  totalApplications: number;
  eligibleApplications: number;
  oaAttemptedCount: number;
  shortlistedCount: number;
  interviewCount: number;
  offerCount: number;
  
  // Conversions
  appToOaRate: number;
  oaToShortlistRate: number;
  shortlistToInterviewRate: number;
  interviewToOfferRate: number;

  // Bottleneck detection
  biggestDrop: {
    fromStage: string;
    toStage: string;
    conversionRate: number;
    dropRate: number;
    lossCount: number;
    description: string;
    keyTakeaway: string;
    isStatisticallySignificant: boolean;
  } | null;

  // Data health
  dataIntegrityScore: number;
  verifiedOaEvidenceCount: number;
}

export interface ObservedFact {
  id: string;
  statement: string;
  evidence: string;
  metric?: string;
}

export interface PossibleFactor {
  id: string;
  factor: string;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
  code: string; // e.g. "A", "B", "C"
}

export interface ProprietaryUnknown {
  id: string;
  statement: string;
  category: string;
}

export interface Experiment {
  id: string;
  code: string; // e.g. "EXP-01"
  badge: string; // e.g. "Recommended for OA Bottleneck"
  badgeType: 'error' | 'secondary' | 'tertiary';
  title: string;
  diagnosticWhy: string;
  actionToTake: string;
  measurableTelemetry: string;
  status: 'ready' | 'in_progress' | 'completed';
  sampleThreshold: number; // e.g. 3
  currentSamples: number; // e.g. 2
  variantName?: string;
}

export interface DiagnosisReport {
  timestamp: string;
  summary: string;
  observed: ObservedFact[];
  possibleFactors: PossibleFactor[];
  unknowns: string[];
  experiments: {
    title: string;
    why: string;
    action: string;
    measure: string;
  }[];
  isAiGenerated: boolean;
}

export interface CohortBenchmark {
  filters: {
    branch: string;
    graduationYear: string;
    cgpaRange: string;
    targetRole: string;
    collegeTier: string;
  };
  sampleSize: number;
  stages: {
    name: string;
    userRate: number;
    cohortRate: number;
    delta: number;
    status: 'parity' | 'critical_drop' | 'insufficient_data';
  }[];
}
