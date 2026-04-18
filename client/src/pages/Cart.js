import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../config/product';

const Cart = () => {
  const { items, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="border border-zinc-100 rounded-2xl p-8 md:p-12 bg-white shadow-sm">
              <div className="bg-zinc-50 border border-zinc-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-4">Your cart is empty</h2>
              <p className="text-zinc-600 mb-8 text-sm font-light">Add some products to your cart to get started.</p>
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 text-white px-8 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-zinc-800"
              >
                <span className="flex items-center justify-center gap-2">
                  Continue Shopping
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-zinc-900 mb-2 sm:mb-4 tracking-tight">
            Shopping <span className="gradient-text">Cart</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-light">{items.length} item(s) in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden border border-zinc-100 rounded-2xl bg-white shadow-sm">
              {items.map((item, index) => (
                <div key={item.id} className={`p-4 sm:p-6 md:p-8 ${index !== items.length - 1 ? 'border-b border-zinc-100' : ''}`}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
                    {/* Product Image */}
                    <div className="bg-zinc-50 border border-zinc-100 p-3 sm:p-4 rounded-2xl flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-xl mx-auto sm:mx-0"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-4 w-full sm:w-auto">
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-900 mb-1 sm:mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-zinc-700">
                          {formatMoney(item.price, item.currency || 'USD')}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-14 text-center text-lg font-semibold text-zinc-900">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-center sm:text-right sm:text-left sm:min-w-[80px]">
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-zinc-900">
                          {formatMoney(item.price * item.quantity, item.currency || 'USD')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-4 sm:mt-6">
              <button
                onClick={clearCart}
                className="text-zinc-600 hover:text-zinc-900 text-sm font-medium flex items-center min-h-[44px] transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 border border-zinc-100 rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-zinc-900 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <span className="text-zinc-600 block truncate font-light">
                        {item.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-900 ml-2">
                      {formatMoney(item.price * item.quantity, item.currency || 'USD')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-semibold text-zinc-900">Total</span>
                  <span className="text-2xl md:text-3xl font-semibold text-zinc-900">
                    {items[0]
                      ? formatMoney(getTotalPrice(), items[0].currency || 'USD')
                      : formatMoney(getTotalPrice(), 'USD')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center rounded-full bg-zinc-950 text-white text-sm font-medium tracking-wide py-3 px-8 mb-6 hover:bg-zinc-800 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <div className="text-center">
                <button
                  onClick={() => navigate('/shop')}
                  className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors duration-300"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-center text-zinc-500 text-sm font-light">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-zinc-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
