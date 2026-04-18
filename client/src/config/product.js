import { formatMoney } from './pricing';

export const PRODUCT_DISPLAY_NAME = 'ArenaWave Earwing';

export { formatMoney } from './pricing';

/** @deprecated use formatMoney(amount, 'USD') */
export function formatUsd(amount) {
  return formatMoney(amount, 'USD');
}
