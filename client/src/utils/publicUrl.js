import { getPublicApiOrigin } from './env';

/**
 * Absolute URL for uploaded assets (/uploads/...).
 * Set VITE_PUBLIC_API_ORIGIN on Netlify, or VITE_API_URL alone (origin is derived).
 */
export function publicAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = getPublicApiOrigin();
  return `${origin}${path}`;
}
