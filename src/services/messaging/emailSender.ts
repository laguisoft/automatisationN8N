import nodemailer, { type Transporter } from 'nodemailer';
import { getConfig } from '../../config';
import { logger } from '../../utils/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const { env } = getConfig();
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const { env } = getConfig();

  if (!env.SMTP_ENABLED) {
    return { success: false, error: 'Envoi email desactive (SMTP_ENABLED=false)' };
  }

  try {
    await getTransporter().sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return { success: true };
  } catch (error) {
    logger.error({ error, to: params.to }, "Echec de l'envoi email");
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
