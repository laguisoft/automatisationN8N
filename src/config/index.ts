import { loadEnv } from './env';
import { loadAppConfig } from './appConfig';

export function getConfig() {
  const env = loadEnv();
  const app = loadAppConfig();
  return { env, app };
}

export type Config = ReturnType<typeof getConfig>;

export * from './env';
export * from './appConfig';
