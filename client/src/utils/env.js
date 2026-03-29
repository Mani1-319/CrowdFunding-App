/**
 * Build-time env (Vite). Set these in Netlify → Site settings → Environment variables.
 */

function stripTrailingSlash(s) {
  return s.replace(/\/+$/, '');
}

/** API base including `/api` (axios). */
export function getApiBaseUrl() {
  const v = import.meta.env.VITE_API_URL;
  if (v) {
    let u = stripTrailingSlash(v);
    if (!/\/api$/i.test(u)) u = `${u}/api`;
    return u;
  }
  if (import.meta.env.DEV) return 'http://localhost:5000/api';
  return '';
}

/** Origin of the Render API (no path) — for Socket.io and static uploads. */
export function getPublicApiOrigin() {
  const explicit = import.meta.env.VITE_PUBLIC_API_ORIGIN;
  if (explicit) return stripTrailingSlash(explicit);

  const api = import.meta.env.VITE_API_URL || '';
  if (!api) {
    return import.meta.env.DEV ? 'http://localhost:5000' : '';
  }
  try {
    const normalized = api.replace(/\/api\/?$/, '');
    return new URL(normalized.endsWith('/') ? normalized : `${normalized}/`).origin;
  } catch {
    return '';
  }
}

/** Socket.io connects to the API host (not the Netlify static origin). */
export function getSocketOrigin() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return stripTrailingSlash(explicit);
  return getPublicApiOrigin();
}
