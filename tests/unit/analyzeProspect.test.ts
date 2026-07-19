process.env.DASHBOARD_API_KEY = 'test-dashboard-api-key';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

jest.mock('../../src/services/claude/client', () => ({
  askClaude: jest.fn(),
}));

import { askClaude } from '../../src/services/claude/client';
import { analyzeProspect } from '../../src/services/claude/analyzeProspect';

const validAnalysis = {
  companyName: 'Pharmacie du Marche',
  city: 'Kankan',
  sector: 'pharmacies',
  address: null,
  phone: null,
  email: null,
  website: null,
  facebookUrl: null,
  linkedinUrl: null,
  description: 'Pharmacie situee au marche central de Kankan',
  probableNeeds: ['gestion de stock'],
  currentSoftware: null,
  commercialPotential: 'moyen',
  urgency: 'moyenne',
  suggestedScore: 30,
  scoreReason: 'Situee a Kankan',
  scoreBreakdown: {
    locatedInKankan: true,
    emailFound: false,
    phoneFound: false,
    websiteFound: false,
    activeFacebookPage: false,
    mentionsManagement: false,
    mentionsStock: true,
    mentionsInvoicing: false,
    seekingSoftware: false,
    recentPublication: false,
  },
};

describe('analyzeProspect', () => {
  beforeEach(() => jest.clearAllMocks());

  it('parses a well-formed JSON response wrapped in a code fence', async () => {
    (askClaude as jest.Mock).mockResolvedValue('```json\n' + JSON.stringify(validAnalysis) + '\n```');

    const result = await analyzeProspect({
      rawText: 'texte extrait',
      sourceUrl: 'https://exemple.com',
      searchQuery: 'pharmacie Kankan',
    });

    expect(result?.companyName).toBe('Pharmacie du Marche');
    expect(result?.scoreBreakdown.mentionsStock).toBe(true);
  });

  it('returns null when the response is not valid JSON', async () => {
    (askClaude as jest.Mock).mockResolvedValue('Je ne peux pas repondre en JSON.');
    const result = await analyzeProspect({
      rawText: 'texte',
      sourceUrl: 'https://exemple.com',
      searchQuery: 'q',
    });
    expect(result).toBeNull();
  });

  it('returns null when companyName is missing', async () => {
    (askClaude as jest.Mock).mockResolvedValue(JSON.stringify({ ...validAnalysis, companyName: null }));
    const result = await analyzeProspect({
      rawText: 'texte',
      sourceUrl: 'https://exemple.com',
      searchQuery: 'q',
    });
    expect(result).toBeNull();
  });

  it('returns null when the response violates the schema', async () => {
    (askClaude as jest.Mock).mockResolvedValue(JSON.stringify({ ...validAnalysis, urgency: 'extreme' }));
    const result = await analyzeProspect({
      rawText: 'texte',
      sourceUrl: 'https://exemple.com',
      searchQuery: 'q',
    });
    expect(result).toBeNull();
  });
});
