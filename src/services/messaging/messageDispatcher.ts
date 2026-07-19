import { sendEmail } from './emailSender';
import { sendWhatsAppMessage } from './whatsappSender';
import { submitContactForm } from './contactFormSubmitter';
import { getConfig } from '../../config';
import { ProspectRepository } from '../../database/repositories/prospectRepository';
import { MessageLogRepository, type MessageChannel } from '../../database/repositories/messageLogRepository';
import type { Prospect } from '../../types';

export class ProspectNotValidatedError extends Error {
  constructor() {
    super('Le prospect doit avoir ete valide manuellement avant tout envoi.');
    this.name = 'ProspectNotValidatedError';
  }
}

export class ConsentRequiredError extends Error {
  constructor() {
    super("Le consentement explicite du prospect est requis pour l'envoi WhatsApp.");
    this.name = 'ConsentRequiredError';
  }
}

export interface DispatchOptions {
  channel: MessageChannel;
  whatsappConsentConfirmed?: boolean;
}

export interface DispatchResult {
  success: boolean;
  error?: string;
}

/**
 * Envoie le message genere pour un prospect, en imposant deux garde-fous :
 *  1. le prospect doit avoir ete valide par un humain (statut `validated`
 *     ou `message_generated` avec message deja genere) ;
 *  2. pour WhatsApp, le consentement doit avoir ete explicitement confirme
 *     par l'appelant (dashboard) a chaque envoi.
 */
export async function dispatchMessage(
  prospect: Prospect,
  options: DispatchOptions,
  deps: {
    prospectRepository?: ProspectRepository;
    messageLogRepository?: MessageLogRepository;
  } = {},
): Promise<DispatchResult> {
  const { env } = getConfig();
  const prospectRepository = deps.prospectRepository ?? new ProspectRepository();
  const messageLogRepository = deps.messageLogRepository ?? new MessageLogRepository();

  if (env.PIPELINE_REQUIRE_HUMAN_VALIDATION) {
    const validStatuses: Prospect['status'][] = ['validated', 'message_generated'];
    if (!validStatuses.includes(prospect.status)) {
      throw new ProspectNotValidatedError();
    }
  }

  if (!prospect.generatedMessage) {
    return { success: false, error: 'Aucun message genere pour ce prospect.' };
  }

  if (options.channel === 'whatsapp' && env.WHATSAPP_REQUIRE_OPT_IN && !options.whatsappConsentConfirmed) {
    throw new ConsentRequiredError();
  }

  let result: DispatchResult;

  switch (options.channel) {
    case 'email':
      if (!prospect.email) {
        result = { success: false, error: 'Aucune adresse email disponible pour ce prospect.' };
      } else {
        result = await sendEmail({
          to: prospect.email,
          subject: `A propos de ${prospect.companyName}`,
          text: prospect.generatedMessage,
        });
      }
      break;
    case 'whatsapp':
      if (!prospect.phone) {
        result = { success: false, error: 'Aucun numero de telephone disponible pour ce prospect.' };
      } else {
        result = await sendWhatsAppMessage({ to: prospect.phone, text: prospect.generatedMessage });
      }
      break;
    case 'contact_form':
      if (!prospect.website) {
        result = { success: false, error: 'Aucun site web disponible pour ce prospect.' };
      } else {
        result = await submitContactForm({
          targetUrl: prospect.website,
          message: prospect.generatedMessage,
          companyName: prospect.companyName,
        });
      }
      break;
    default:
      result = { success: false, error: `Canal inconnu : ${options.channel as string}` };
  }

  await messageLogRepository.record({
    prospectId: prospect.id,
    channel: options.channel,
    content: prospect.generatedMessage,
    status: result.success ? 'sent' : 'failed',
    error: result.error,
  });

  if (result.success) {
    await prospectRepository.markSent(prospect.id, options.channel);
  }

  return result;
}
