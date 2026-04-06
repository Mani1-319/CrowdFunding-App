/**
 * Build-time env (Vite). Set these in Netlify → Site settings → Environment variables.
 */

function stripTrailingSlash(s) {
  return s.replace(/\/+$/, '');
}

/** API base including `/api` (axios). */
export function getApiBaseUrl() {
  return 'https://crowdfunding-app-0onj.onrender.com/api';
}

/** Origin of the Render API (no path) — for Socket.io and static uploads. */
export function getPublicApiOrigin() {
  return 'https://crowdfunding-app-0onj.onrender.com';
}

/** Socket.io connects to the API host. */
export function getSocketOrigin() {
  return getPublicApiOrigin();
}
