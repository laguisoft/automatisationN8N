const TAB_CODE = 9;
const NEWLINE_CODE = 10;

function stripControlCharacters(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 32 || code === TAB_CODE || code === NEWLINE_CODE) out += char;
  }
  return out;
}

/** Nettoie un texte brut extrait du web avant analyse (espaces, caracteres de controle). */
export function cleanText(input: string | null | undefined): string {
  if (!input) return '';
  return stripControlCharacters(input.replace(/\r/g, ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Normalise un numero de telephone guineen vers le format +224XXXXXXXX. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) return null;

  const local = digits.replace(/^00224/, '').replace(/^224/, '');
  if (local.length === 9 && (local.startsWith('6') || local.startsWith('7'))) {
    return `+224${local}`;
  }
  if (digits.startsWith('224') && digits.length === 12) {
    return `+${digits}`;
  }
  return local.length >= 8 ? `+224${local.slice(-9)}` : null;
}

/** Normalise une adresse email (minuscules, sans espaces). */
export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed) ? trimmed : null;
}

/** Normalise une URL de site web (schema https par defaut, sans slash final). */
export function normalizeWebsite(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return null;
  }
}
