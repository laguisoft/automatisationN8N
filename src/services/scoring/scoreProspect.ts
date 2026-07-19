import { loadAppConfig } from '../../config/appConfig';
import type { ScoreBreakdown } from '../../types';

export interface ScoringResult {
  score: number;
  reason: string;
}

/**
 * Calcule le score final a partir du detail des criteres (`scoreBreakdown`,
 * rempli par Claude lors de l'analyse) et des ponderations de
 * `config/scoring-weights.json`. Le score n'est jamais laisse au libre
 * arbitre du modele : il est recalcule cote serveur pour rester coherent et
 * ajustable sans nouvel appel a l'IA.
 */
export function scoreProspect(breakdown: ScoreBreakdown, aiReason: string): ScoringResult {
  const { scoringWeights } = loadAppConfig();
  const triggered: string[] = [];
  let score = 0;

  for (const [criterionKey, isTriggered] of Object.entries(breakdown)) {
    if (!isTriggered) continue;
    const criterion = scoringWeights.criteria[criterionKey];
    if (!criterion) continue;
    score += criterion.points;
    triggered.push(`${criterion.description} (+${criterion.points})`);
  }

  score = Math.min(score, scoringWeights.maxScore);

  const reason =
    triggered.length > 0
      ? `${triggered.join(', ')}. ${aiReason}`.trim()
      : aiReason || 'Aucun critere de scoring declenche.';

  return { score, reason };
}
