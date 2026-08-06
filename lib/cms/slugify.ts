const COMBINING_DIACRITICAL_MARKS = new RegExp('[̀-ͯ]', 'g')

/** Transliterates Vietnamese diacritics to base Latin letters before the usual ASCII slug collapse — a plain `[^a-z0-9]` strip mangles "Núi Phú Sĩ" into "n-i-ph-s" instead of "nui-phu-si". */
export function slugifyVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_DIACRITICAL_MARKS, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
