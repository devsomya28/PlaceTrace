import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with required telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/gemini/diagnose
app.post('/api/gemini/diagnose', async (req, res) => {
  try {
    const { applications = [], profile = {} } = req.body;

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server; fallback to deterministic engine.',
      });
    }

    // Prepare empirical statistics to ground Gemini
    const totalApps = applications.length;
    const oaApps = applications.filter((a: any) => a.oaAttempted).length;
    const shortlists = applications.filter((a: any) => a.shortlisted === 'yes').length;
    const interviews = applications.filter((a: any) => a.interview === 'yes').length;
    const offers = applications.filter((a: any) => a.offer === 'yes').length;

    // Filter out unnecessary PII before sending to model
    const anonymizedHistory = applications.map((a: any) => ({
      company: a.company,
      role: a.role,
      roleTrack: a.roleTrack || 'General',
      tier: a.tier || 'Standard',
      eligible: a.eligible,
      oaAttempted: a.oaAttempted,
      oaScore: a.oaScore,
      codingScore: a.codingScore,
      aptitudeScore: a.aptitudeScore,
      sqlScore: a.sqlScore,
      csScore: a.csScore,
      shortlisted: a.shortlisted,
      interview: a.interview,
      offer: a.offer,
      notes: a.notes,
      feedback: a.feedback,
      jdExcerpt: a.jdText ? a.jdText.slice(0, 300) : undefined,
    }));

    const prompt = `
Analyze this student placement funnel empirically:
Profile:
- Target Role: ${profile.targetRole || 'Software Engineering'}
- Branch: ${profile.branch || 'Engineering'}
- CGPA: ${profile.cgpa || 'N/A'}
- Primary Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'N/A'}

Recorded Telemetry:
- Total Applications: ${totalApps}
- OA Attempted: ${oaApps} (${totalApps > 0 ? Math.round((oaApps / totalApps) * 100) : 0}% clearance)
- Shortlisted: ${shortlists} (${oaApps > 0 ? Math.round((shortlists / oaApps) * 100) : 0}% conversion from OA)
- Interviews: ${interviews}
- Offers: ${offers}

Application Records:
${JSON.stringify(anonymizedHistory, null, 2)}

Produce a JSON diagnostic report following these mandatory rules:
1. NEVER claim to know why a company rejected a candidate.
2. NEVER generate fake hiring probabilities or fake chance percentages.
3. NEVER invent company-specific internal selection formulas.
4. Distinguish:
   - "observed": statements directly backed by the provided records
   - "possibleFactors": candidate hypotheses worth investigating. EVERY hypothesis reason MUST contain the exact disclaimer: "This is a hypothesis, not a confirmed rejection reason."
   - "unknowns": explicit list of opaque employer black-box variables that cannot be known by the student.
   - "experiments": 3 concrete, controlled actions to test in upcoming applications.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are the PlaceTrace Empirical Diagnostic Engine. Your role is to separate facts from hypotheses and unknowns for engineering students navigating campus and off-campus placements.
Return clean JSON matching this exact structure:
{
  "summary": "High level empirical synthesis of the funnel",
  "observed": [
    { "id": "obs-1", "statement": "...", "evidence": "...", "metric": "..." }
  ],
  "possibleFactors": [
    { "id": "factor-1", "code": "A", "factor": "Title", "reason": "... (This is a hypothesis, not a confirmed rejection reason.)", "confidence": "high|medium|low" }
  ],
  "unknowns": [
    "The employer's internal shortlist algorithm..."
  ],
  "experiments": [
    { "title": "...", "why": "...", "action": "...", "measure": "..." }
  ]
}`,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const report = JSON.parse(text);
    return res.json({ report });
  } catch (error: any) {
    console.error('Error generating AI diagnosis:', error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'Gemini error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// In development, hook Vite middleware. In production, serve dist.
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PlaceTrace telemetry server running on port ${PORT}`);
});
