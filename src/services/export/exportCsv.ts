import type { Prospect } from '../../types';

const COLUMNS: Array<{ header: string; value: (p: Prospect) => string }> = [
  { header: 'Entreprise', value: (p) => p.companyName },
  { header: 'Ville', value: (p) => p.city ?? '' },
  { header: 'Secteur', value: (p) => p.sector ?? '' },
  { header: 'Telephone', value: (p) => p.phone ?? '' },
  { header: 'Email', value: (p) => p.email ?? '' },
  { header: 'Site web', value: (p) => p.website ?? '' },
  { header: 'Score', value: (p) => String(p.score) },
  { header: 'Potentiel', value: (p) => p.commercialPotential },
  { header: 'Urgence', value: (p) => p.urgency },
  { header: 'Statut', value: (p) => p.status },
  { header: 'Cree le', value: (p) => p.createdAt.toISOString() },
];

function escapeCsvValue(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Genere un export CSV (separateur virgule, encodage UTF-8 avec BOM pour Excel). */
export function exportProspectsToCsv(prospects: Prospect[]): string {
  const header = COLUMNS.map((c) => escapeCsvValue(c.header)).join(',');
  const rows = prospects.map((p) => COLUMNS.map((c) => escapeCsvValue(c.value(p))).join(','));
  const BOM = String.fromCharCode(0xfeff);
  return [BOM + header, ...rows].join('\n');
}
