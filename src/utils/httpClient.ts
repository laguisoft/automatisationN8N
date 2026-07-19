import axios, { type AxiosInstance } from 'axios';
import { getConfig } from '../config';

let instance: AxiosInstance | null = null;

/** Client HTTP partage, avec le User-Agent identifiable requis pour un usage ethique. */
export function getHttpClient(): AxiosInstance {
  if (!instance) {
    const { env } = getConfig();
    instance = axios.create({
      timeout: 15_000,
      headers: { 'User-Agent': env.EXTRACTION_USER_AGENT },
    });
  }
  return instance;
}
