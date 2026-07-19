import { Router } from 'express';
import { runProspectingPipeline } from './pipeline';
import { logger } from '../../utils/logger';

export const prospectingRouter = Router();

/**
 * Declenche un run complet de prospection. Appele soit par le noeud Cron de
 * n8n (workflows/01-lead-discovery-pipeline.json), soit manuellement.
 * Execute de maniere synchrone : pour un run long, prevoir un timeout HTTP
 * suffisant cote n8n (Settings > Timeout du noeud HTTP Request).
 */
prospectingRouter.post('/run', async (req, res) => {
  const triggeredBy = (req.body?.triggeredBy as string | undefined) ?? 'api';

  try {
    const summary = await runProspectingPipeline(triggeredBy);
    res.json(summary);
  } catch (error) {
    logger.error({ error }, 'Echec du run de prospection');
    res.status(500).json({ error: 'Echec du run de prospection.' });
  }
});
