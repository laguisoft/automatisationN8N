import { loadAppConfig } from '../../config/appConfig';

/** Construit la liste des requetes de recherche a executer pour un run, bornee par les limites configurees. */
export function buildSearchQueries(maxQueries: number): string[] {
  const { searchQueries, sectors } = loadAppConfig();

  const locations = [...searchQueries.locations].sort((a, b) => a.priority - b.priority);
  const sectorLabels = sectors.sectors.map((s) => s.label);

  const queries: string[] = [];

  outer: for (const location of locations) {
    for (const sector of sectorLabels) {
      for (const template of searchQueries.queryTemplates) {
        queries.push(
          template.replace('{sector}', sector).replace('{location}', location.name),
        );
        if (queries.length >= maxQueries) break outer;
      }
    }
  }

  return queries;
}
