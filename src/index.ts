import { getConfig } from './config';
import { createServer } from './server';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  const { env } = getConfig();
  const app = createServer();

  const server = app.listen(env.APP_PORT, () => {
    logger.info(`${env.APP_NAME} demarre sur le port ${env.APP_PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Signal ${signal} recu, arret du serveur...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error({ error }, 'Echec du demarrage de l\'application');
  process.exit(1);
});
