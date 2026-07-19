import { readFileSync } from 'fs';
import { join } from 'path';

// __dirname pointe vers src/services/claude (dev) ou dist/services/claude
// (prod) ; /prompts est trois niveaux au-dessus dans les deux cas.
const PROMPTS_DIR = join(__dirname, '..', '..', '..', 'prompts');

const cache = new Map<string, string>();

function loadPromptFile(filename: string): string {
  if (!cache.has(filename)) {
    cache.set(filename, readFileSync(join(PROMPTS_DIR, filename), 'utf-8'));
  }
  return cache.get(filename) as string;
}

export function renderPrompt(filename: string, variables: Record<string, string>): string {
  let content = loadPromptFile(filename);
  for (const [key, value] of Object.entries(variables)) {
    content = content.split(`{{${key}}}`).join(value);
  }
  return content;
}
