import { normalizeEmail, normalizePhone, normalizeWebsite } from '../cleaning/cleanText';
import type { ClaudeAnalysis, ExtractedPage } from '../../types';

export interface ReconciledContact {
  phone: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
}

/**
 * Reconcilie les coordonnees extraites automatiquement de la page (regex,
 * plus fiables car verifiees par pattern) avec celles identifiees par
 * Claude dans le texte (peut capter des formulations que la regex manque).
 */
export function reconcileContactInfo(
  page: ExtractedPage | null,
  analysis: ClaudeAnalysis,
): ReconciledContact {
  const phone = normalizePhone(page?.phones[0] ?? analysis.phone);
  const email = normalizeEmail(page?.emails[0] ?? analysis.email);
  const website = normalizeWebsite(page?.url ?? analysis.website);
  const facebookUrl = page?.facebookUrls[0] ?? analysis.facebookUrl ?? null;
  const linkedinUrl = page?.linkedinUrls[0] ?? analysis.linkedinUrl ?? null;

  return { phone, email, website, facebookUrl, linkedinUrl };
}
