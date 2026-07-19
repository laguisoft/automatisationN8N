import { normalizeCompanyName } from '../../src/services/cleaning/normalizeCompany';

describe('normalizeCompanyName', () => {
  it('lowercases, strips accents and legal suffixes', () => {
    expect(normalizeCompanyName('Établissement Général du Nord SARL')).toBe('general du nord');
  });

  it('produces the same key for equivalent variants', () => {
    const a = normalizeCompanyName('Pharmacie de l’Espoir');
    const b = normalizeCompanyName('PHARMACIE DE L ESPOIR');
    expect(a).toBe(b);
  });
});
