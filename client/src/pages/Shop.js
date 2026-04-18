import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { PRODUCT_DISPLAY_NAME } from '../config/product';
import ProductPixelReveal from '../components/ProductPixelReveal';

// Temporary launch hold: set to false when ready to restore add-to-cart flow.
const SHOP_CTA_HOLD = true;

const Shop = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { geoReady } = usePricing();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (SHOP_CTA_HOLD) return;
    addToCart(quantity);
    navigate('/cart');
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-500 mb-4">ArenaWave</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-4">
            {PRODUCT_DISPLAY_NAME}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto font-light leading-relaxed">
            In-venue receiver for live commentary and event audio. Stadium scale. No internet required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="flex items-center justify-center order-1">
            <div className="w-full max-w-lg">
              <div className="relative aspect-square flex items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-100">
                <ProductPixelReveal
                  src="/Earwing.png"
                  alt={PRODUCT_DISPLAY_NAME}
                  className="h-full w-full"
                  imgClassName="w-3/5 h-auto object-contain"
                />
              </div>
              <p className="text-center text-xs text-zinc-500 mt-4 font-light">{PRODUCT_DISPLAY_NAME}</p>
            </div>
          </div>

          <div className="order-2 border border-zinc-100 rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
            <div className="space-y-6 sm:space-y-8">
              {/* Price hidden during launch hold — restore block when showing prices again.
              <div>
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight min-h-[2.5rem] flex items-center">
                    {!geoReady ? (
                      <span className="inline-block w-28 h-9 bg-zinc-200 rounded-md animate-pulse" aria-hidden />
                    ) : (
                      formatPrice(unitPrice)
                    )}
                  </h2>
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Per unit</span>
                </div>
                {geoReady && (
                  <p className="text-xs text-zinc-500 font-light mt-2">
                    Price for your region (
                    {currency === 'INR'
                      ? 'India'
                      : 'US, Canada, Mexico, and other regions'}
                    )
                  </p>
                )}
              </div>
              */}

              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">About</h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-light">
                  A lightweight Earwing device for real-time, synchronized audio at sports venues, concerts,
                  and large live events—without depending on fan connectivity.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Highlights</h3>
                <ul className="space-y-2 text-sm text-zinc-600 font-light">
                  <li className="flex gap-2">
                    <span className="text-zinc-400">—</span>
                    Works with venue FM broadcast
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400">—</span>
                    Comfortable for full events
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400">—</span>
                    Built for high-volume crowds
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-14 text-center text-lg font-semibold text-zinc-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2 font-light">Up to 10 units per order</p>
              </div>

              {/* Total hidden during launch hold — restore block when showing prices again.
              <div className="border-t border-zinc-100 pt-6 flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-900">Total</span>
                <span className="text-xl font-semibold text-zinc-900">
                  {!geoReady ? (
                    <span className="inline-block w-24 h-8 bg-zinc-200 rounded-md animate-pulse" aria-hidden />
                  ) : (
                    formatMoney(quantity * unitPrice, currency)
                  )}
                </span>
              </div>
              */}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={SHOP_CTA_HOLD || !geoReady}
                className="w-full py-3.5 rounded-full bg-zinc-950 text-white text-sm font-medium tracking-wide hover:bg-zinc-800 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {SHOP_CTA_HOLD ? 'Something big is brewing' : 'Add to cart'}
              </button>

              <p className="text-center text-xs text-zinc-500 font-light">Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
