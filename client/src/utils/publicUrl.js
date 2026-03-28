/**
 * Absolute URL for uploaded assets (/uploads/...).
 * Dev: set VITE_PUBLIC_API_ORIGIN=https://crowdfunding-app-0onj.onrender.com in client/.env
 * Prod (same host as API): leave unset so paths are same-origin.
 */
export function publicAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = import.meta.env.VITE_PUBLIC_API_ORIGIN || '';
  return `${origin}${path}`;
}
