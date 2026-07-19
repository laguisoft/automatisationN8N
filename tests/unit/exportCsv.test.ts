import { exportProspectsToCsv } from '../../src/services/export/exportCsv';
import type { Prospect } from '../../src/types';

function makeProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: '1',
    companyName: 'Boutique Test',
    city: 'Kankan',
    sector: 'boutiques',
    address: null,
    phone: '+224622123456',
    email: 'contact@exemple.com',
    website: null,
    facebookUrl: null,
    linkedinUrl: null,
    description: null,
    probableNeeds: [],
    currentSoftware: null,
    commercialPotential: 'moyen',
    urgency: 'moyenne',
    score: 80,
    scoreReason: 'Test',
    scoreBreakdown: {
      locatedInKankan: true,
      emailFound: true,
      phoneFound: true,
      websiteFound: false,
      activeFacebookPage: false,
      mentionsManagement: false,
      mentionsStock: false,
      mentionsInvoicing: false,
      seekingSoftware: false,
      recentPublication: false,
    },
    sourceUrls: [],
    searchQuery: null,
    dedupHash: 'hash',
    status: 'pending_validation',
    generatedMessage: null,
    validatedBy: null,
    validatedAt: null,
    sentAt: null,
    sentChannel: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('exportProspectsToCsv', () => {
  it('includes the header row and one row per prospect', () => {
    const csv = exportProspectsToCsv([makeProspect(), makeProspect({ id: '2', companyName: 'Pharmacie Test' })]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('Entreprise');
    expect(lines[1]).toContain('Boutique Test');
    expect(lines[2]).toContain('Pharmacie Test');
  });

  it('escapes values containing commas', () => {
    const csv = exportProspectsToCsv([makeProspect({ city: 'Kankan, Haute-Guinee' })]);
    expect(csv).toContain('"Kankan, Haute-Guinee"');
  });
});
