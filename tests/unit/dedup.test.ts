import { computeDedupHash } from '../../src/services/dedup/computeDedupHash';
import { deduplicateBatch } from '../../src/services/dedup/deduplicateBatch';

describe('computeDedupHash', () => {
  it('produces the same hash for the same website regardless of path/case', () => {
    const a = computeDedupHash({ companyName: 'Boutique A', website: 'https://Exemple.com/accueil' });
    const b = computeDedupHash({ companyName: 'Boutique A - autre titre', website: 'exemple.com' });
    expect(a).toBe(b);
  });

  it('produces the same hash for the same phone number in different formats', () => {
    const a = computeDedupHash({ companyName: 'Quincaillerie B', phone: '622 12 34 56' });
    const b = computeDedupHash({ companyName: 'Quincaillerie B', phone: '+224622123456' });
    expect(a).toBe(b);
  });

  it('falls back to name+city when no website or phone is available', () => {
    const a = computeDedupHash({ companyName: 'Restaurant Le Baobab', city: 'Kankan' });
    const b = computeDedupHash({ companyName: 'restaurant le baobab', city: 'kankan' });
    expect(a).toBe(b);
  });

  it('produces different hashes for different companies', () => {
    const a = computeDedupHash({ companyName: 'Restaurant Le Baobab', city: 'Kankan' });
    const b = computeDedupHash({ companyName: 'Hotel Central', city: 'Kankan' });
    expect(a).not.toBe(b);
  });
});

describe('deduplicateBatch', () => {
  it('keeps only the first occurrence of each duplicate', () => {
    const items = [
      { companyName: 'Boutique A', website: 'https://exemple.com' },
      { companyName: 'Boutique A (doublon)', website: 'https://exemple.com/' },
      { companyName: 'Boutique C', website: 'https://autre-site.com' },
    ];
    const result = deduplicateBatch(items);
    expect(result).toHaveLength(2);
    expect(result[0].companyName).toBe('Boutique A');
    expect(result[1].companyName).toBe('Boutique C');
  });
});
