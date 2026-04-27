import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getPricingForCountryCode, formatMoney } from '../config/pricing';
import { API_BASE_URL } from '../config/api';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [countryCode, setCountryCode] = useState(null);
  const [geoReady, setGeoReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${API_BASE_URL}/api/geo/country`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error('geo failed');
        const data = await res.json();
        const code = data?.countryCode ? String(data.countryCode).toUpperCase() : null;
        if (!cancelled) setCountryCode(code);
      } catch {
        if (!cancelled) setCountryCode(null);
      } finally {
        if (!cancelled) setGeoReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const { pricingRegion, unitPrice, currency } = getPricingForCountryCode(countryCode);
    return {
      geoReady,
      countryCode,
      pricingRegion,
      unitPrice,
      currency,
      formatPrice: (amount) => formatMoney(amount, currency),
    };
  }, [geoReady, countryCode]);

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error('usePricing must be used within PricingProvider');
  }
  return ctx;
}
