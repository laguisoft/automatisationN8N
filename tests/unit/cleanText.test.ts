import { cleanText, normalizeEmail, normalizePhone, normalizeWebsite } from '../../src/services/cleaning/cleanText';

describe('cleanText', () => {
  it('collapses repeated spaces/tabs and trims', () => {
    expect(cleanText('  Bonjour   le \t\t monde  ')).toBe('Bonjour le monde');
  });

  it('collapses more than two consecutive newlines', () => {
    expect(cleanText('Ligne 1\n\n\n\nLigne 2')).toBe('Ligne 1\n\nLigne 2');
  });

  it('returns empty string for null/undefined', () => {
    expect(cleanText(null)).toBe('');
    expect(cleanText(undefined)).toBe('');
  });
});

describe('normalizePhone', () => {
  it('normalizes a local Guinean mobile number', () => {
    expect(normalizePhone('622 12 34 56')).toBe('+224622123456');
  });

  it('normalizes a number already prefixed with +224', () => {
    expect(normalizePhone('+224 622 12 34 56')).toBe('+224622123456');
  });

  it('returns null for too-short input', () => {
    expect(normalizePhone('123')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(normalizePhone(null)).toBeNull();
  });
});

describe('normalizeEmail', () => {
  it('lowercases and validates a proper email', () => {
    expect(normalizeEmail('Contact@Exemple.COM')).toBe('contact@exemple.com');
  });

  it('rejects an invalid email', () => {
    expect(normalizeEmail('pas-un-email')).toBeNull();
  });
});

describe('normalizeWebsite', () => {
  it('adds https scheme when missing', () => {
    expect(normalizeWebsite('exemple.com/accueil/')).toBe('https://exemple.com/accueil');
  });

  it('returns null for invalid input', () => {
    expect(normalizeWebsite('   ')).toBeNull();
  });
});
