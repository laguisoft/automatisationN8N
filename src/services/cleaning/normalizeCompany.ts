/** Normalise un nom d'entreprise pour comparaison (dedup, recherche) : minuscules, sans accents ni ponctuation. */
export function normalizeCompanyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\b(sarl|sa|sarlu|etablissement|ets|societe|entreprise)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
