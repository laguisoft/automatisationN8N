import type { NextFunction, Request, Response } from 'express';
import { getConfig } from '../config';

/** Authentification simple par cle d'API, partagee par le dashboard et les endpoints appeles par n8n. */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const { env } = getConfig();
  const providedKey = req.header('x-api-key');

  if (!providedKey || providedKey !== env.DASHBOARD_API_KEY) {
    res.status(401).json({ error: 'Cle API manquante ou invalide (en-tete x-api-key).' });
    return;
  }

  next();
}
