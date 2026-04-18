/** Region keys must match server validation in routes/orders.js */
export const PRICING_REGION = {
  NORTH_AMERICA: 'north_america',
  INDIA: 'india',
};

const NORTH_AMERICA_ISO2 = new Set(['US', 'CA', 'MX']);

/**
 * @param {string | null | undefined} countryCode ISO 3166-1 alpha-2 from geo lookup
 */
export function getPricingForCountryCode(countryCode) {
  const code = countryCode ? String(countryCode).toUpperCase() : null;
  if (code === 'IN') {
    return {
      pricingRegion: PRICING_REGION.INDIA,
      unitPrice: 1000,
      currency: 'INR',
    };
  }
  if (code && NORTH_AMERICA_ISO2.has(code)) {
    return {
      pricingRegion: PRICING_REGION.NORTH_AMERICA,
      unitPrice: 20,
      currency: 'USD',
    };
  }
  // Rest of world: same as North America listing ($20 USD)
  return {
    pricingRegion: PRICING_REGION.NORTH_AMERICA,
    unitPrice: 20,
    currency: 'USD',
  };
}

export function formatMoney(amount, currency) {
  const c = currency === 'INR' ? 'INR' : 'USD';
  const locale = c === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 0,
  }).format(amount);
}
