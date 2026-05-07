export function getValidImageSrc(src: unknown, fallback: string): string {
  if (typeof src !== 'string') {
    return fallback;
  }

  const trimmed = src.trim();

  if (!trimmed || trimmed === 'string' || trimmed === '[object Object]') {
    return fallback;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}