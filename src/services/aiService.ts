import { Application, StudentProfile, DiagnosisReport } from '../types/placement';
import { generateDeterministicDiagnosis } from './diagnosisGenerator';

export interface AIServiceResponse {
  report: DiagnosisReport;
  source: 'gemini' | 'deterministic';
  error?: string;
}

export const aiService = {
  async runDiagnosis(applications: Application[], profile: StudentProfile): Promise<AIServiceResponse> {
    try {
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applications,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.report) {
        return {
          report: {
            ...data.report,
            isAiGenerated: true,
          },
          source: 'gemini',
        };
      }
      throw new Error('Invalid JSON format from AI server');
    } catch (err: any) {
      console.warn('Gemini AI diagnosis service fallback to deterministic engine:', err?.message || err);
      const fallbackReport = generateDeterministicDiagnosis(applications, profile);
      return {
        report: fallbackReport,
        source: 'deterministic',
        error: err?.message,
      };
    }
  },
};
