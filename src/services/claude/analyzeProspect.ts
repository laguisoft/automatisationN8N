import { z } from 'zod';
import { askClaude } from './client';
import { renderPrompt } from './promptLoader';
import { loadAppConfig } from '../../config/appConfig';
import { logger } from '../../utils/logger';
import type { ClaudeAnalysis } from '../../types';

const scoreBreakdownSchema = z.object({
  locatedInKankan: z.boolean(),
  emailFound: z.boolean(),
  phoneFound: z.boolean(),
  websiteFound: z.boolean(),
  activeFacebookPage: z.boolean(),
  mentionsManagement: z.boolean(),
  mentionsStock: z.boolean(),
  mentionsInvoicing: z.boolean(),
  seekingSoftware: z.boolean(),
  recentPublication: z.boolean(),
});

const analysisSchema = z.object({
  companyName: z.string().nullable(),
  city: z.string().nullable(),
  sector: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  description: z.string().nullable(),
  probableNeeds: z.array(z.string()),
  currentSoftware: z.string().nullable(),
  commercialPotential: z.enum(['faible', 'moyen', 'eleve']),
  urgency: z.enum(['faible', 'moyenne', 'haute']),
  suggestedScore: z.number().min(0).max(100),
  scoreReason: z.string(),
  scoreBreakdown: scoreBreakdownSchema,
});

function extractJson(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/```\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

/**
 * Analyse un contenu web extrait avec Claude et retourne une analyse
 * structuree, ou `null` si le contenu ne decrit pas une entreprise
 * exploitable (companyName manquant).
 */
export async function analyzeProspect(input: {
  rawText: string;
  sourceUrl: string;
  searchQuery: string;
}): Promise<ClaudeAnalysis | null> {
  const { companyProfile, sectors } = loadAppConfig();

  const prompt = renderPrompt('lead-analysis.md', {
    COMPANY_PROFILE: companyProfile.name,
    TARGET_SECTORS: sectors.sectors.map((s) => s.label).join(', '),
    SEARCH_QUERY: input.searchQuery,
    SOURCE_URL: input.sourceUrl,
    RAW_TEXT: input.rawText.slice(0, 8000),
  });

  const raw = await askClaude({
    prompt,
    maxTokens: 1200,
    temperature: 0.2,
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(raw));
  } catch (error) {
    logger.warn({ error, sourceUrl: input.sourceUrl }, 'Reponse Claude non-JSON, prospect ignore');
    return null;
  }

  const result = analysisSchema.safeParse(parsedJson);
  if (!result.success) {
    logger.warn(
      { issues: result.error.issues, sourceUrl: input.sourceUrl },
      'Reponse Claude ne respecte pas le schema attendu, prospect ignore',
    );
    return null;
  }

  if (!result.data.companyName) return null;

  return { ...result.data, companyName: result.data.companyName };
}
