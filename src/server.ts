import path from 'path';
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getConfig } from './config';
import { requireApiKey } from './middleware/auth';
import { dashboardRouter } from './modules/dashboard/routes';
import { prospectingRouter } from './modules/prospecting/routes';
import { logsRouter } from './modules/logs/routes';
import { logger } from './utils/logger';

export function createServer(): Express {
  const { env } = getConfig();
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: env.APP_NAME, env: env.NODE_ENV });
  });

  app.use('/api', requireApiKey, dashboardRouter);
  app.use('/api/prospecting', requireApiKey, prospectingRouter);
  app.use('/api/logs', requireApiKey, logsRouter);

  app.use(express.static(path.join(__dirname, 'modules', 'dashboard', 'public')));

  app.use((req, res) => {
    res.status(404).json({ error: 'Route introuvable', path: req.path });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Erreur non geree');
    res.status(500).json({ error: 'Erreur interne du serveur' });
  });

  return app;
}
