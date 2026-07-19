import { createHash } from 'crypto';
import { normalizeCompanyName } from '../cleaning/normalizeCompany';
import { normalizeWebsite, normalizePhone } from '../cleaning/cleanText';

export interface DedupIdentity {
  companyName: string;
  city?: string | null;
  website?: string | null;
  phone?: string | null;
}

/**
 * Calcule une empreinte stable identifiant une entreprise, en priorisant les
 * identifiants les plus fiables (domaine du site, telephone) et en repliant
 * sur nom + ville normalises si aucun des deux n'est disponible.
 */
export function computeDedupHash(identity: DedupIdentity): string {
  const website = normalizeWebsite(identity.website ?? null);
  const phone = normalizePhone(identity.phone ?? null);
  const normalizedName = normalizeCompanyName(identity.companyName);
  const normalizedCity = (identity.city ?? '').trim().toLowerCase();

  let key: string;
  if (website) {
    key = `website:${new URL(website).hostname.replace(/^www\./, '')}`;
  } else if (phone) {
    key = `phone:${phone}`;
  } else {
    key = `name-city:${normalizedName}:${normalizedCity}`;
  }

  return createHash('sha256').update(key).digest('hex');
}
