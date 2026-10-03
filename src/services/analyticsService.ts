import { Application, FunnelAnalysis, FunnelStageMetrics } from '../types/placement';

export const analyticsService = {
  calculateFunnel(applications: Application[]): FunnelAnalysis {
    const totalApplications = applications.length;
    
    if (totalApplications === 0) {
      return {
        totalApplications: 0,
        eligibleApplications: 0,
        oaAttemptedCount: 0,
        shortlistedCount: 0,
        interviewCount: 0,
        offerCount: 0,
        appToOaRate: 0,
        oaToShortlistRate: 0,
        shortlistToInterviewRate: 0,
        interviewToOfferRate: 0,
        biggestDrop: null,
        dataIntegrityScore: 0,
        verifiedOaEvidenceCount: 0,
      };
    }

    const eligibleApplications = applications.filter((a) => a.eligible).length;
    const oaAttemptedCount = applications.filter((a) => a.oaAttempted).length;
    const shortlistedCount = applications.filter((a) => a.shortlisted === 'yes').length;
    const interviewCount = applications.filter((a) => a.interview === 'yes').length;
    const offerCount = applications.filter((a) => a.offer === 'yes').length;

    // Rate calculations with zero-division safeguards
    const appToOaRate = totalApplications > 0 
      ? Math.round((oaAttemptedCount / totalApplications) * 100) 
      : 0;

    const oaToShortlistRate = oaAttemptedCount > 0 
      ? Math.round((shortlistedCount / oaAttemptedCount) * 100) 
      : 0;

    const shortlistToInterviewRate = shortlistedCount > 0 
      ? Math.round((interviewCount / shortlistedCount) * 100) 
      : 0;

    const interviewToOfferRate = interviewCount > 0 
      ? Math.round((offerCount / interviewCount) * 100) 
      : 0;

    // Calculate transition drops
    interface TransitionCandidate {
      fromStage: string;
      toStage: string;
      conversionRate: number;
      dropRate: number;
      lossCount: number;
      fromCount: number;
      toCount: number;
      description: string;
      keyTakeaway: string;
    }

    const transitions: TransitionCandidate[] = [];

    if (totalApplications > 0) {
      const drop = 100 - appToOaRate;
      transitions.push({
        fromStage: 'Application',
        toStage: 'OA',
        conversionRate: appToOaRate,
        dropRate: drop,
        lossCount: totalApplications - oaAttemptedCount,
        fromCount: totalApplications,
        toCount: oaAttemptedCount,
        description: `${totalApplications - oaAttemptedCount} of ${totalApplications} applications did not reach the online assessment stage.`,
        keyTakeaway: 'Bottleneck lies in initial resume screening or eligibility cutoffs prior to test invitations.'
      });
    }

    if (oaAttemptedCount > 0) {
      const drop = 100 - oaToShortlistRate;
      transitions.push({
        fromStage: 'OA',
        toStage: 'Shortlisted',
        conversionRate: oaToShortlistRate,
        dropRate: drop,
        lossCount: oaAttemptedCount - shortlistedCount,
        fromCount: oaAttemptedCount,
        toCount: shortlistedCount,
        description: `${oaAttemptedCount - shortlistedCount} of your ${oaAttemptedCount} recorded OAs did not progress to the next observed stage, while your application-to-OA eligibility clearance remains high at ${appToOaRate}%.`,
        keyTakeaway: 'Bottleneck lies in OA test scoring/rank cutoffs or resume shortlist thresholds rather than eligibility screening filters.'
      });
    }

    if (shortlistedCount > 0) {
      const drop = 100 - shortlistToInterviewRate;
      transitions.push({
        fromStage: 'Shortlisted',
        toStage: 'Interview',
        conversionRate: shortlistToInterviewRate,
        dropRate: drop,
        lossCount: shortlistedCount - interviewCount,
        fromCount: shortlistedCount,
        toCount: interviewCount,
        description: `${shortlistedCount - interviewCount} shortlisted candidates were not scheduled for interviews.`,
        keyTakeaway: 'Interview scheduling capacity or second-pass recruiter filters caused drops after confirmation.'
      });
    }

    if (interviewCount > 0) {
      const drop = 100 - interviewToOfferRate;
      transitions.push({
        fromStage: 'Interview',
        toStage: 'Offer',
        conversionRate: interviewToOfferRate,
        dropRate: drop,
        lossCount: interviewCount - offerCount,
        fromCount: interviewCount,
        toCount: offerCount,
        description: `${interviewCount - offerCount} candidates in final interviews have not received an offer yet.`,
        keyTakeaway: 'Interviews completed but offer decision pending or final partner round rejection.'
      });
    }

    // Determine the biggest observable drop (prioritizing significant samples where loss > 0)
    let biggestDrop = null;
    if (transitions.length > 0) {
      // Sort primarily by highest dropRate, but require at least 1 loss
      const ranked = [...transitions].sort((a, b) => {
        if (b.dropRate !== a.dropRate) return b.dropRate - a.dropRate;
        return b.lossCount - a.lossCount;
      });

      const top = ranked[0];
      if (top && top.dropRate > 0) {
        biggestDrop = {
          fromStage: top.fromStage,
          toStage: top.toStage,
          conversionRate: top.conversionRate,
          dropRate: top.dropRate,
          lossCount: top.lossCount,
          description: top.description,
          keyTakeaway: top.keyTakeaway,
          isStatisticallySignificant: top.fromCount >= 3
        };
      }
    }

    // Evidence & data integrity scoring
    const appsWithOa = applications.filter((a) => a.oaAttempted);
    const verifiedOaEvidenceCount = appsWithOa.filter(
      (a) => (a.codingScore && a.codingScore !== 'N/A') || (a.aptitudeScore && a.aptitudeScore !== 'N/A') || a.oaScore
    ).length;

    const dataIntegrityScore = appsWithOa.length > 0
      ? Math.round((verifiedOaEvidenceCount / appsWithOa.length) * 100)
      : (totalApplications > 0 ? 70 : 0);

    return {
      totalApplications,
      eligibleApplications,
      oaAttemptedCount,
      shortlistedCount,
      interviewCount,
      offerCount,
      appToOaRate,
      oaToShortlistRate,
      shortlistToInterviewRate,
      interviewToOfferRate,
      biggestDrop,
      dataIntegrityScore,
      verifiedOaEvidenceCount,
    };
  },

  getStageMetrics(analysis: FunnelAnalysis): FunnelStageMetrics[] {
    const { 
      totalApplications, 
      oaAttemptedCount, 
      shortlistedCount, 
      interviewCount, 
      offerCount,
      appToOaRate,
      oaToShortlistRate,
      shortlistToInterviewRate,
      interviewToOfferRate,
      biggestDrop
    } = analysis;

    const isOaBottleneck = biggestDrop?.fromStage === 'OA' && biggestDrop?.toStage === 'Shortlisted';

    return [
      {
        stageNumber: '01',
        code: 'INTAKE',
        name: 'Applications',
        count: totalApplications,
        subtext: 'Applied',
        conversionFromPrev: 100,
        dropFromPrev: 0,
        overallPercentage: 100,
      },
      {
        stageNumber: '02',
        code: 'EVALUATION',
        name: 'Online Assessment',
        count: oaAttemptedCount,
        subtext: `${appToOaRate}% clearance`,
        conversionFromPrev: appToOaRate,
        dropFromPrev: 100 - appToOaRate,
        overallPercentage: totalApplications > 0 ? Math.round((oaAttemptedCount / totalApplications) * 100) : 0,
      },
      {
        stageNumber: '03',
        code: isOaBottleneck ? 'ATTRITION' : 'SELECTION',
        name: 'Shortlisted',
        count: shortlistedCount,
        subtext: `${oaToShortlistRate}% retained`,
        conversionFromPrev: oaToShortlistRate,
        dropFromPrev: 100 - oaToShortlistRate,
        overallPercentage: totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0,
        isBottleneck: isOaBottleneck,
      },
      {
        stageNumber: '04',
        code: 'ROUNDS',
        name: 'Interview',
        count: interviewCount,
        subtext: `${shortlistToInterviewRate}% conversion`,
        conversionFromPrev: shortlistToInterviewRate,
        dropFromPrev: 100 - shortlistToInterviewRate,
        overallPercentage: totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0,
      },
      {
        stageNumber: '05',
        code: 'RESULT',
        name: 'Offer',
        count: offerCount,
        subtext: offerCount > 0 ? `${interviewToOfferRate}% yield` : 'Pending / In Review',
        conversionFromPrev: interviewToOfferRate,
        dropFromPrev: 100 - interviewToOfferRate,
        overallPercentage: totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0,
      },
    ];
  }
};
