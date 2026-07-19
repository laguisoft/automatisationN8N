import { Router } from 'express';
import { ProspectRepository } from '../../database/repositories/prospectRepository';
import { generateMessage } from '../../services/claude/generateMessage';
import {
  dispatchMessage,
  ConsentRequiredError,
  ProspectNotValidatedError,
} from '../../services/messaging/messageDispatcher';
import { exportProspectsToCsv } from '../../services/export/exportCsv';
import { exportProspectsToExcel } from '../../services/export/exportExcel';
import { exportProspectsToPdf } from '../../services/export/exportPdf';
import { logger } from '../../utils/logger';
import type { ProspectStatus } from '../../types';

export const dashboardRouter = Router();
const prospectRepository = new ProspectRepository();

dashboardRouter.get('/prospects', async (req, res) => {
  const { status, city, sector, minScore, search, limit, offset } = req.query;

  const { items, total } = await prospectRepository.findMany({
    status: status as ProspectStatus | undefined,
    city: city as string | undefined,
    sector: sector as string | undefined,
    minScore: minScore ? Number(minScore) : undefined,
    search: search as string | undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });

  res.json({ items, total });
});

dashboardRouter.get('/prospects/:id', async (req, res) => {
  const prospect = await prospectRepository.findById(req.params.id);
  if (!prospect) {
    res.status(404).json({ error: 'Prospect introuvable' });
    return;
  }
  res.json(prospect);
});

dashboardRouter.post('/prospects/:id/validate', async (req, res) => {
  const validatedBy = (req.body?.validatedBy as string | undefined) ?? 'dashboard';
  const prospect = await prospectRepository.updateStatus(req.params.id, 'validated', { validatedBy });
  if (!prospect) {
    res.status(404).json({ error: 'Prospect introuvable' });
    return;
  }
  res.json(prospect);
});

dashboardRouter.post('/prospects/:id/reject', async (req, res) => {
  const validatedBy = (req.body?.validatedBy as string | undefined) ?? 'dashboard';
  const prospect = await prospectRepository.updateStatus(req.params.id, 'rejected', { validatedBy });
  if (!prospect) {
    res.status(404).json({ error: 'Prospect introuvable' });
    return;
  }
  res.json(prospect);
});

dashboardRouter.post('/prospects/:id/generate-message', async (req, res) => {
  const prospect = await prospectRepository.findById(req.params.id);
  if (!prospect) {
    res.status(404).json({ error: 'Prospect introuvable' });
    return;
  }
  if (prospect.status !== 'validated') {
    res.status(409).json({ error: 'Le prospect doit etre valide avant de generer un message.' });
    return;
  }

  try {
    const message = await generateMessage(prospect);
    const updated = await prospectRepository.setGeneratedMessage(prospect.id, message);
    res.json(updated);
  } catch (error) {
    logger.error({ error, prospectId: prospect.id }, 'Echec de la generation du message');
    res.status(502).json({ error: 'Echec de la generation du message via Claude.' });
  }
});

dashboardRouter.post('/prospects/:id/send', async (req, res) => {
  const prospect = await prospectRepository.findById(req.params.id);
  if (!prospect) {
    res.status(404).json({ error: 'Prospect introuvable' });
    return;
  }

  const channel = req.body?.channel as 'email' | 'whatsapp' | 'contact_form' | undefined;
  if (!channel) {
    res.status(400).json({ error: 'Le champ "channel" est requis (email, whatsapp, contact_form).' });
    return;
  }

  try {
    const result = await dispatchMessage(prospect, {
      channel,
      whatsappConsentConfirmed: Boolean(req.body?.whatsappConsentConfirmed),
    });
    res.json(result);
  } catch (error) {
    if (error instanceof ProspectNotValidatedError || error instanceof ConsentRequiredError) {
      res.status(409).json({ error: error.message });
      return;
    }
    logger.error({ error, prospectId: prospect.id }, "Echec de l'envoi du message");
    res.status(502).json({ error: 'Echec de l\'envoi du message.' });
  }
});

dashboardRouter.get('/prospects/export/csv', async (req, res) => {
  const { items } = await prospectRepository.findMany({ limit: 10_000 });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="prospects.csv"');
  res.send(exportProspectsToCsv(items));
});

dashboardRouter.get('/prospects/export/xlsx', async (req, res) => {
  const { items } = await prospectRepository.findMany({ limit: 10_000 });
  const buffer = await exportProspectsToExcel(items);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', 'attachment; filename="prospects.xlsx"');
  res.send(buffer);
});

dashboardRouter.get('/prospects/export/pdf', async (req, res) => {
  const { items } = await prospectRepository.findMany({ limit: 10_000 });
  const buffer = await exportProspectsToPdf(items);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="prospects.pdf"');
  res.send(buffer);
});
