import { Application, StudentProfile, DiagnosisReport } from '../types/placement';
import { analyticsService } from './analyticsService';

export function generateDeterministicDiagnosis(
  applications: Application[],
  profile: StudentProfile
): DiagnosisReport {
  const funnel = analyticsService.calculateFunnel(applications);

  // Not enough data
  if (applications.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      summary: 'No applications recorded yet. Add your first application to begin tracking your placement funnel.',
      observed: [
        {
          id: 'obs-empty',
          statement: 'No placement applications have been recorded yet.',
          evidence: 'Add at least one application to start generating empirical observations.',
        }
      ],
      possibleFactors: [],
      unknowns: [
        "The employer's internal shortlist algorithm and ranking formula are strictly private.",
        'Recruiter ranking criteria and relative performance vs. peer pool are undisclosed.',
        'Specific hiring quota allocations across branches and diversity pools remain unknown.',
      ],
      experiments: [],
      isAiGenerated: false,
    };
  }

  // --- OBSERVED FACTS (strictly from data) ---
  const observed = [];

  // Fact 1: Total applications
  observed.push({
    id: 'obs-1',
    statement: `You have recorded ${funnel.totalApplications} placement application${funnel.totalApplications === 1 ? '' : 's'} in PlaceTrace.`,
    evidence: `${funnel.eligibleApplications} of ${funnel.totalApplications} met eligibility criteria (CGPA, branch, backlogs).`,
    metric: `${funnel.totalApplications}`,
  });

  // Fact 2: OA stage
  if (funnel.oaAttemptedCount > 0) {
    observed.push({
      id: 'obs-2',
      statement: `${funnel.oaAttemptedCount} of ${funnel.totalApplications} applications proceeded to an Online Assessment (OA). That is a ${funnel.appToOaRate}% Application → OA conversion rate.`,
      evidence: `${funnel.totalApplications - funnel.oaAttemptedCount} applications did not reach the OA stage — possibly due to ineligibility, portal closure, or no invitation received.`,
      metric: `${funnel.oaAttemptedCount}/${funnel.totalApplications} → ${funnel.appToOaRate}%`,
    });
  } else {
    observed.push({
      id: 'obs-2',
      statement: `None of your ${funnel.totalApplications} recorded applications have reached the OA stage yet.`,
      evidence: 'Mark "OA Attempted" on your applications once you receive and complete an assessment.',
      metric: `0/${funnel.totalApplications}`,
    });
  }

  // Fact 3: Shortlist stage
  if (funnel.oaAttemptedCount > 0) {
    observed.push({
      id: 'obs-3',
      statement: `${funnel.shortlistedCount} of ${funnel.oaAttemptedCount} recorded OAs resulted in a shortlist. That is a ${funnel.oaToShortlistRate}% OA → Shortlist conversion rate.`,
      evidence: funnel.shortlistedCount === 0
        ? `None of the ${funnel.oaAttemptedCount} completed OAs have progressed to a confirmed shortlist yet.`
        : `${funnel.oaAttemptedCount - funnel.shortlistedCount} OA submissions did not receive a shortlist confirmation.`,
      metric: `${funnel.shortlistedCount}/${funnel.oaAttemptedCount} → ${funnel.oaToShortlistRate}%`,
    });
  }

  // Fact 4: Interview stage
  if (funnel.shortlistedCount > 0) {
    observed.push({
      id: 'obs-4',
      statement: `${funnel.interviewCount} of ${funnel.shortlistedCount} shortlisted applications proceeded to a technical interview. That is a ${funnel.shortlistToInterviewRate}% Shortlist → Interview conversion.`,
      evidence: funnel.interviewCount === 0
        ? 'No shortlisted candidate has been scheduled for a technical interview yet.'
        : `${funnel.shortlistedCount - funnel.interviewCount} shortlisted candidates were not scheduled for interviews.`,
      metric: `${funnel.interviewCount}/${funnel.shortlistedCount} → ${funnel.shortlistToInterviewRate}%`,
    });
  }

  // Fact 5: Offer stage
  if (funnel.interviewCount > 0) {
    observed.push({
      id: 'obs-5',
      statement: `${funnel.offerCount} of ${funnel.interviewCount} technical interviews resulted in an offer. That is a ${funnel.interviewToOfferRate}% Interview → Offer conversion.`,
      evidence: funnel.offerCount === 0
        ? 'No offer has been received yet from completed interviews.'
        : `${funnel.offerCount} offer${funnel.offerCount > 1 ? 's' : ''} received.`,
      metric: `${funnel.offerCount}/${funnel.interviewCount} → ${funnel.interviewToOfferRate}%`,
    });
  }

  // Fact 6: OA section evidence (if available)
  const appsWithSectionScores = applications.filter(
    a => a.oaAttempted && (a.codingScore || a.aptitudeScore || a.sqlScore || a.csScore)
  );
  const appsWithLowAptitude = appsWithSectionScores.filter(
    a => a.aptitudeScore && (
      a.aptitudeScore.toLowerCase().includes('low') ||
      a.aptitudeScore.toLowerCase().includes('42%') ||
      a.aptitudeScore.toLowerCase().includes('50%') ||
      a.aptitudeScore.toLowerCase().includes('fail')
    )
  );
  if (appsWithSectionScores.length > 0) {
    observed.push({
      id: 'obs-section',
      statement: `Section-wise OA scores are recorded for ${appsWithSectionScores.length} of ${funnel.oaAttemptedCount} OAs.${appsWithLowAptitude.length > 0 ? ` In ${appsWithLowAptitude.length} case(s), aptitude scores were recorded as low or below 60%.` : ' Coding/DSA scores appear recorded; other sections may need more data.'}`,
      evidence: `${funnel.verifiedOaEvidenceCount} OA submission(s) have verified section-level evidence (Data Integrity Score: ${funnel.dataIntegrityScore}%).`,
      metric: `${funnel.verifiedOaEvidenceCount}/${funnel.oaAttemptedCount} verified`,
    });
  }

  // --- POSSIBLE FACTORS (hypotheses tied to what data shows) ---
  const possibleFactors = [];
  const biggestDrop = funnel.biggestDrop;

  if (biggestDrop?.fromStage === 'OA' || (funnel.oaAttemptedCount > 0 && funnel.oaToShortlistRate < 50)) {
    possibleFactors.push({
      id: 'factor-1',
      code: 'A',
      factor: 'Composite OA Section Cutoffs',
      reason: `Your data shows ${funnel.oaAttemptedCount} OAs with only ${funnel.oaToShortlistRate}% shortlist conversion. Many companies apply weighted cutoffs across all OA sections — not just coding. If your aptitude, SQL, or core CS scores are weaker than the coding section, the composite score may be falling below the cutoff threshold. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: funnel.oaAttemptedCount >= 3 ? 'high' as const : 'medium' as const,
    });

    possibleFactors.push({
      id: 'factor-2',
      code: 'B',
      factor: 'Rank-Based Shortlisting (Not Pass/Fail)',
      reason: `Some campus placement drives shortlist candidates by rank within the test batch, not by absolute score threshold. Even a strong OA score may not shortlist if the cohort performed better. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: 'medium' as const,
    });
  }

  if (biggestDrop?.fromStage === 'Application' || funnel.appToOaRate < 60) {
    possibleFactors.push({
      id: 'factor-app',
      code: 'A',
      factor: 'Application Eligibility or Timing',
      reason: `Only ${funnel.appToOaRate}% of your applications reached the OA stage. This could indicate missed eligibility requirements, late applications after cohort was filled, or drives that didn't send OA invitations to all applicants. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: funnel.totalApplications >= 3 ? 'high' as const : 'low' as const,
    });
  }

  if (funnel.shortlistedCount > 0 && funnel.shortlistToInterviewRate < 70) {
    possibleFactors.push({
      id: 'factor-shortlist',
      code: 'C',
      factor: 'Post-Shortlist Resume Re-screening',
      reason: `${funnel.shortlistedCount - funnel.interviewCount} shortlisted candidate(s) did not progress to interviews. Some companies perform a second-pass resume filter or internal capacity constraint after the OA round that reduces the interview slot count below the shortlist count. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: 'medium' as const,
    });
  }

  if (funnel.interviewCount > 0 && funnel.interviewToOfferRate < 50) {
    possibleFactors.push({
      id: 'factor-interview',
      code: 'D',
      factor: 'Technical Interview Performance Pattern',
      reason: `${funnel.interviewCount - funnel.offerCount} interview(s) did not result in an offer. Interview success depends on problem-solving depth, communication, and system design, which may differ from OA performance. Recording interview notes and feedback can help identify if there is a recurring gap. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: funnel.interviewCount >= 2 ? 'medium' as const : 'low' as const,
    });
  }

  // Always add a general factor if we have little data
  if (applications.length < 5) {
    possibleFactors.push({
      id: 'factor-data',
      code: possibleFactors.length === 0 ? 'A' : String.fromCharCode(65 + possibleFactors.length),
      factor: 'Insufficient Data for Strong Pattern Detection',
      reason: `With only ${applications.length} recorded application(s), the funnel cannot yet reveal statistically reliable patterns. Recording at least 5–10 applications will enable more specific bottleneck identification. This is a hypothesis, not a confirmed rejection reason.`,
      confidence: 'low' as const,
    });
  }

  // --- UNKNOWNS (always present) ---
  const unknowns = [
    "The employer's internal shortlist algorithm, rank-based cutoffs, and batch-level quotas are strictly private and cannot be known by the student.",
    'Your relative performance vs. the full applicant pool (percentile rank, peer scores) is not disclosed by any recruiter portal.',
    'Specific hiring quota allocations across branches, diversity pools, or college tiers remain employer-internal decisions.',
    'Internal interview rubric scoring, bar-raiser feedback, and offer approval chains are fully opaque to the candidate.',
    'The exact reason for any individual application rejection is known only by the employer and cannot be determined from external evidence.',
  ];

  // --- EXPERIMENTS (matched to the actual bottleneck) ---
  const experiments = [];

  if (funnel.oaAttemptedCount >= 2 && funnel.oaToShortlistRate < 60) {
    // Bottleneck is OA → Shortlist
    experiments.push({
      title: 'Track All OA Sections Separately',
      why: `Your OA → Shortlist rate is ${funnel.oaToShortlistRate}%. You have ${funnel.verifiedOaEvidenceCount} OA(s) with section scores recorded and ${funnel.oaAttemptedCount - funnel.verifiedOaEvidenceCount} without. Without section-level data, the exact failure mechanism is unknown.`,
      action: `On your next 3 OAs, record your Coding score, Aptitude score, SQL/DB score, and Core CS score separately in PlaceTrace right after each test.`,
      measure: 'After 3 more OAs with full section data, compare section scores across shortlisted vs. non-shortlisted submissions to identify which section correlates with progression.',
    });

    experiments.push({
      title: 'A/B Test: Timed Aptitude Practice Before OA',
      why: `OA shortlisting may be composite-score-based. If aptitude is limiting, targeted practice can shift the balance. Currently you have insufficient sectional data to confirm or deny this.`,
      action: 'Before your next 3 OAs, spend 20 minutes on timed aptitude practice (quant + verbal). Record your aptitude score each time. Compare to prior OA aptitude scores.',
      measure: 'Aptitude score change across the 3 new OAs vs. prior baseline. Check whether shortlist rate changes.',
    });
  } else if (funnel.appToOaRate < 60 && funnel.totalApplications >= 2) {
    // Bottleneck is Application → OA
    experiments.push({
      title: 'Audit Eligibility Criteria Before Applying',
      why: `Only ${funnel.appToOaRate}% of your applications reached the OA stage. Applications that fail eligibility checks at the portal level never generate an OA invitation.`,
      action: 'Before applying to each company, explicitly record: cutoff CGPA, branch eligibility, backlog status, and bond terms in PlaceTrace. Mark applications that fail any criterion as ineligible.',
      measure: 'Track whether applications you pre-verified for eligibility have a higher OA invitation rate than those applied without checking.',
    });
  } else if (funnel.shortlistedCount > 0 && funnel.shortlistToInterviewRate < 70) {
    // Bottleneck is Shortlist → Interview
    experiments.push({
      title: 'Follow Up on Shortlist Emails Within 24h',
      why: `${funnel.shortlistedCount - funnel.interviewCount} shortlisted application(s) did not proceed to interview. Some drives allocate interviews on a first-come, first-confirmed basis from the shortlist email.`,
      action: 'On your next shortlist confirmation, immediately confirm your slot, check for any response deadline in the email, and contact the placement cell if no interview schedule arrives within 48 hours.',
      measure: 'Track whether prompt follow-up after shortlist increases the proportion of shortlisted → interview conversions.',
    });
  }

  // Always add an evidence quality experiment
  experiments.push({
    title: 'Attach Section Scores to Every OA',
    why: `Your Data Integrity Score is ${funnel.dataIntegrityScore}%. High-quality OA evidence (coding score, aptitude score, SQL score) makes it possible to find patterns that drive shortlisting. Low-quality records cannot be diagnosed.`,
    action: 'Immediately after each OA, return to PlaceTrace and fill in: Coding test pass rate, Aptitude score (%), SQL/DB score, and any recruiter notes. Aim to complete all fields within 30 minutes of the test.',
    measure: `Raise OA evidence coverage from ${funnel.verifiedOaEvidenceCount}/${funnel.oaAttemptedCount} to 100% over the next 5 OAs.`,
  });

  // Generate the summary
  let summary = '';
  if (funnel.totalApplications === 0) {
    summary = 'No data recorded yet.';
  } else if (funnel.oaAttemptedCount === 0) {
    summary = `You have recorded ${funnel.totalApplications} application(s) but none have reached the OA stage. Keep tracking as drives progress.`;
  } else if (biggestDrop) {
    summary = `Across ${funnel.totalApplications} recorded applications, your data shows the largest observable drop at ${biggestDrop.fromStage} → ${biggestDrop.toStage} with a ${biggestDrop.conversionRate}% conversion rate (${biggestDrop.lossCount} record(s) lost at this stage). ${biggestDrop.isStatisticallySignificant ? 'This sample is large enough to be worth investigating.' : 'Sample size is small — keep recording more applications to increase confidence.'} This diagnosis does NOT establish why any company rejected you. It only reflects what your own recorded data shows.`;
  } else {
    summary = `Across ${funnel.totalApplications} recorded application(s), the funnel appears healthy with no major observable bottleneck yet. Continue recording outcomes to reveal patterns.`;
  }

  return {
    timestamp: new Date().toISOString(),
    summary,
    observed,
    possibleFactors,
    unknowns,
    experiments,
    isAiGenerated: false,
  };
}
