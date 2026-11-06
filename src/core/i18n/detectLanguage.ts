const SUPPORTED_LANGUAGES = ['en', 'pt-BR', 'es-ES', 'ja'];

/** Maps the device's preferred languages to a supported locale (pt-PT → pt-BR, es-MX → es-ES). */
export function detectDeviceLanguage(
  preferred: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language],
): string {
  for (const tag of preferred) {
    const exact = SUPPORTED_LANGUAGES.find((l) => l.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
    const base = tag.split('-')[0]?.toLowerCase();
    const byBase = SUPPORTED_LANGUAGES.find((l) => l.split('-')[0] === base);
    if (byBase) return byBase;
  }
  return 'en';
}
