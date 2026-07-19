import { scoreProspect } from '../../src/services/scoring/scoreProspect';
import type { ScoreBreakdown } from '../../src/types';

const emptyBreakdown: ScoreBreakdown = {
  locatedInKankan: false,
  emailFound: false,
  phoneFound: false,
  websiteFound: false,
  activeFacebookPage: false,
  mentionsManagement: false,
  mentionsStock: false,
  mentionsInvoicing: false,
  seekingSoftware: false,
  recentPublication: false,
};

describe('scoreProspect', () => {
  it('returns 0 when no criteria are triggered', () => {
    const { score } = scoreProspect(emptyBreakdown, 'Rien de particulier');
    expect(score).toBe(0);
  });

  it('sums the configured weights for triggered criteria', () => {
    const breakdown: ScoreBreakdown = {
      ...emptyBreakdown,
      locatedInKankan: true, // +30
      emailFound: true, // +10
      phoneFound: true, // +10
    };
    const { score } = scoreProspect(breakdown, 'test');
    expect(score).toBe(50);
  });

  it('caps the score at 100 even if all criteria are triggered', () => {
    const allTrue: ScoreBreakdown = Object.fromEntries(
      Object.keys(emptyBreakdown).map((key) => [key, true]),
    ) as unknown as ScoreBreakdown;
    const { score } = scoreProspect(allTrue, 'tout est vrai');
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBe(100);
  });

  it('includes triggered criteria descriptions in the reason', () => {
    const breakdown: ScoreBreakdown = { ...emptyBreakdown, seekingSoftware: true };
    const { reason } = scoreProspect(breakdown, 'Cherche un ERP');
    expect(reason).toContain('Cherche un ERP');
  });
});
