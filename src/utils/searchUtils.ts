/**
 * Utility helpers for ultra-robust disaster response ID and entity search.
 * Handles messy user input like '#182', 'P-182', '182', 'hh 402', 'bld a', etc.
 */

export function normalizeSearchTerm(term: string): {
  raw: string;
  cleaned: string;
  digitsOnly: string;
  lettersOnly: string;
} {
  const raw = term.trim().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9]/g, '');
  const digitsOnly = raw.replace(/\D/g, '');
  const lettersOnly = raw.replace(/[^a-z]/g, '');
  return { raw, cleaned, digitsOnly, lettersOnly };
}

export function matchesIdOrText(
  value: string | undefined | null,
  query: string
): boolean {
  if (!value || !query.trim()) return false;
  const { raw, cleaned, digitsOnly } = normalizeSearchTerm(query);
  const targetRaw = value.trim().toLowerCase();
  const targetCleaned = targetRaw.replace(/[^a-z0-9]/g, '');
  const targetDigits = targetRaw.replace(/\D/g, '');

  // 1. Direct substring match
  if (targetRaw.includes(raw)) return true;

  // 2. Cleaned alphanumeric match (e.g., 'p-182' matches 'p182' or 'hh402' matches 'hh-402')
  if (cleaned && targetCleaned.includes(cleaned)) return true;

  // 3. Digits match if user typed only numbers (e.g., '182' matches 'P182', 'R182', or '#182')
  if (digitsOnly && digitsOnly.length >= 2 && targetDigits.includes(digitsOnly)) {
    return true;
  }

  return false;
}
