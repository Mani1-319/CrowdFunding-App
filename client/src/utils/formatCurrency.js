/**
 * Indian Rupee formatting (en-IN: lakh/crore-style grouping, ₹ symbol).
 * @param {number|string|null|undefined} amount
 * @param {{ minimumFractionDigits?: number, maximumFractionDigits?: number }} [options]
 */
export function formatInr(amount, options = {}) {
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;

  const raw =
    typeof amount === 'number' && Number.isFinite(amount)
      ? amount
      : Number.parseFloat(String(amount ?? '').replace(/,/g, ''));
  const n = Number.isFinite(raw) ? raw : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(n);
}

/** Whole rupees only (no paise), e.g. goals and raised totals. */
export function formatInrWhole(amount) {
  return formatInr(amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
