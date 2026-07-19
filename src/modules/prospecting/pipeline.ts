import { getConfig } from '../../config';
import { loadAppConfig } from '../../config/appConfig';
import { logger } from '../../utils/logger';
import { mapWithConcurrency } from '../../utils/concurrency';
import { SearchAggregator } from '../../services/search/searchAggregator';
import { extractCompanyInfo } from '../../services/extraction/extractCompanyInfo';
import { analyzeProspect } from '../../services/claude/analyzeProspect';
import { scoreProspect } from '../../services/scoring/scoreProspect';
import { reconcileContactInfo } from '../../services/contacts/reconcileContactInfo';
import { computeDedupHash } from '../../services/dedup/computeDedupHash';
import { ProspectRepository } from '../../database/repositories/prospectRepository';
import { PipelineRunRepository } from '../../database/repositories/pipelineRunRepository';
import { LogRepository } from '../../database/repositories/logRepository';
import { buildSearchQueries } from './queryBuilder';
import type { NewProspectInput } from '../../types';

const EXTRACTION_CONCURRENCY = 3;

export interface PipelineRunSummary {
  runId: string;
  status: 'success' | 'partial' | 'failed';
  prospectsFound: number;
  prospectsNew: number;
  errorsCount: number;
  enabledSearchEngines: string[];
}

export async function runProspectingPipeline(triggeredBy: string): Promise<PipelineRunSummary> {
  const { env } = getConfig();
  const { searchQueries } = loadAppConfig();

  const pipelineRunRepository = new PipelineRunRepository();
  const prospectRepository = new ProspectRepository();
  const logRepository = new LogRepository();
  const searchAggregator = new SearchAggregator();

  const run = await pipelineRunRepository.start(triggeredBy);
  const log = (stage: Parameters<LogRepository['log']>[0]['stage'], level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) =>
    logRepository.log({ runId: run.id, stage, level, message, metadata });

  let prospectsFound = 0;
  let prospectsNew = 0;
  let errorsCount = 0;

  try {
    const maxQueries = Math.min(env.PIPELINE_MAX_QUERIES_PER_RUN, searchQueries.maxQueriesPerRun);
    const maxResultsPerQuery = Math.min(env.PIPELINE_MAX_RESULTS_PER_QUERY, searchQueries.maxResultsPerQuery);
    const queries = buildSearchQueries(maxQueries);

    await log('search', 'info', `Demarrage du run : ${queries.length} requetes planifiees`, {
      engines: searchAggregator.listEnabledEngines(),
    });

    const seenUrls = new Set<string>();

    for (const query of queries) {
      const results = await searchAggregator.searchAll(query, maxResultsPerQuery);
      await log('search', 'info', `${results.length} resultats pour "${query}"`, { query });

      const newResults = results.filter((r) => !seenUrls.has(r.url));
      newResults.forEach((r) => seenUrls.add(r.url));

      await mapWithConcurrency(newResults, EXTRACTION_CONCURRENCY, async (result) => {
        try {
          const page = await extractCompanyInfo(result.url);
          const rawText = page?.textContent || result.snippet;
          if (!rawText) return;

          const analysis = await analyzeProspect({
            rawText,
            sourceUrl: result.url,
            searchQuery: result.query,
          });
          if (!analysis) return;

          prospectsFound += 1;

          const contact = reconcileContactInfo(page, analysis);
          const dedupHash = computeDedupHash({
            companyName: analysis.companyName,
            city: analysis.city,
            website: contact.website,
            phone: contact.phone,
          });

          const existing = await prospectRepository.findByDedupHash(dedupHash);
          if (existing) {
            await log('dedup', 'info', `Doublon ignore : ${analysis.companyName}`, { dedupHash });
            return;
          }

          const { score, reason } = scoreProspect(analysis.scoreBreakdown, analysis.scoreReason);

          const input: NewProspectInput = {
            companyName: analysis.companyName,
            city: analysis.city,
            sector: analysis.sector,
            address: analysis.address,
            phone: contact.phone,
            email: contact.email,
            website: contact.website,
            facebookUrl: contact.facebookUrl,
            linkedinUrl: contact.linkedinUrl,
            description: analysis.description,
            probableNeeds: analysis.probableNeeds,
            currentSoftware: analysis.currentSoftware,
            commercialPotential: analysis.commercialPotential,
            urgency: analysis.urgency,
            score,
            scoreReason: reason,
            scoreBreakdown: analysis.scoreBreakdown,
            sourceUrls: [result.url],
            searchQuery: result.query,
            dedupHash,
          };

          const created = await prospectRepository.create(input, run.id);
          await prospectRepository.updateStatus(created.id, 'pending_validation');
          prospectsNew += 1;

          await log('database', 'info', `Nouveau prospect enregistre : ${created.companyName} (score ${score})`, {
            prospectId: created.id,
          });
        } catch (error) {
          errorsCount += 1;
          logger.error({ error, url: result.url }, 'Erreur lors du traitement d\'un resultat');
          await log('analysis', 'error', `Erreur sur ${result.url}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }

    const status = errorsCount === 0 ? 'success' : prospectsNew > 0 ? 'partial' : 'failed';
    await pipelineRunRepository.finish(run.id, status, {
      prospectsFound,
      prospectsNew,
      prospectsValidated: 0,
      messagesSent: 0,
      errorsCount,
    });

    return {
      runId: run.id,
      status,
      prospectsFound,
      prospectsNew,
      errorsCount,
      enabledSearchEngines: searchAggregator.listEnabledEngines(),
    };
  } catch (error) {
    errorsCount += 1;
    logger.error({ error, runId: run.id }, 'Echec du pipeline de prospection');
    await log('search', 'error', 'Echec critique du run', {
      error: error instanceof Error ? error.message : String(error),
    });
    await pipelineRunRepository.finish(run.id, 'failed', {
      prospectsFound,
      prospectsNew,
      prospectsValidated: 0,
      messagesSent: 0,
      errorsCount,
    });
    throw error;
  }
}
