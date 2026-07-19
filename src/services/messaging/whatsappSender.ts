import { getHttpClient } from '../../utils/httpClient';
import { getConfig } from '../../config';
import { logger } from '../../utils/logger';

/**
 * Envoi via l'API officielle WhatsApp Business Cloud (Meta Graph API).
 * Necessite un numero verifie et un modele de message approuve pour tout
 * premier contact hors fenetre de 24h - voir docs/apis-guide.md.
 *
 * Le consentement (opt-in) est une condition obligatoire, verifiee par
 * l'appelant (messageDispatcher) avant d'invoquer cette fonction : aucun
 * envoi WhatsApp n'a lieu sans confirmation explicite de consentement.
 */
export async function sendWhatsAppMessage(params: {
  to: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const { env } = getConfig();

  if (!env.WHATSAPP_ENABLED) {
    return { success: false, error: 'Envoi WhatsApp desactive (WHATSAPP_ENABLED=false)' };
  }
  if (!env.WHATSAPP_BUSINESS_PHONE_ID || !env.WHATSAPP_BUSINESS_TOKEN) {
    return { success: false, error: 'Identifiants WhatsApp Business manquants' };
  }

  try {
    const http = getHttpClient();
    await http.post(
      `https://graph.facebook.com/v19.0/${env.WHATSAPP_BUSINESS_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: params.to.replace(/[^\d+]/g, ''),
        type: 'text',
        text: { body: params.text },
      },
      { headers: { Authorization: `Bearer ${env.WHATSAPP_BUSINESS_TOKEN}` } },
    );
    return { success: true };
  } catch (error) {
    logger.error({ error, to: params.to }, "Echec de l'envoi WhatsApp");
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
