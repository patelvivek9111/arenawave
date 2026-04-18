import { formatMoney } from '../config/pricing';

/**
 * Format an order total using stored currency (defaults to USD for legacy orders).
 */
export function formatOrderMoney(totalPrice, currency) {
  return formatMoney(totalPrice, currency || 'USD');
}

/**
 * Summarize totals when orders may use multiple currencies.
 * @returns {{ single: string } | { multi: string[] }}
 */
export function summarizeTotalsByCurrency(orders) {
  if (!orders?.length) {
    return { single: formatMoney(0, 'USD') };
  }
  const map = {};
  for (const o of orders) {
    const c = o.currency || 'USD';
    map[c] = (map[c] || 0) + (o.total_price || 0);
  }
  const keys = Object.keys(map);
  if (keys.length === 1) {
    return { single: formatMoney(map[keys[0]], keys[0]) };
  }
  return { multi: keys.sort().map((c) => formatMoney(map[c], c)) };
}
