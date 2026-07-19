import Anthropic from '@anthropic-ai/sdk';
import { getConfig } from '../../config';

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    const { env } = getConfig();
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function askClaude(params: {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const { env } = getConfig();
  const claude = getClaudeClient();

  const response = await claude.messages.create({
    model: env.CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 1024,
    temperature: params.temperature ?? 0.3,
    system: params.system,
    messages: [{ role: 'user', content: params.prompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Reponse Claude sans contenu texte');
  }
  return textBlock.text;
}
