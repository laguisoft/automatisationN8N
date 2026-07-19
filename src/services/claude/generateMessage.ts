import { askClaude } from './client';
import { renderPrompt } from './promptLoader';
import { loadAppConfig } from '../../config/appConfig';
import type { Prospect } from '../../types';

/** Genere le message commercial personnalise pour un prospect valide par un humain. */
export async function generateMessage(prospect: Prospect): Promise<string> {
  const { companyProfile } = loadAppConfig();

  const prompt = renderPrompt('message-generation.md', {
    COMPANY_PROFILE: companyProfile.name,
    VALUE_PROPOSITION: companyProfile.valueProposition,
    CALL_TO_ACTION: companyProfile.callToAction,
    SIGNATURE: companyProfile.signature,
    PROSPECT_JSON: JSON.stringify(
      {
        companyName: prospect.companyName,
        city: prospect.city,
        sector: prospect.sector,
        description: prospect.description,
        probableNeeds: prospect.probableNeeds,
        currentSoftware: prospect.currentSoftware,
      },
      null,
      2,
    ),
  });

  const message = await askClaude({ prompt, maxTokens: 500, temperature: 0.5 });
  return message.trim();
}
