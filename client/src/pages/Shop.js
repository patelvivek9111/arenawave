import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Shop = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(quantity);
    navigate('/cart');
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            FM Radio <span className="gradient-text">Earwing</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed px-1">
            Experience premium audio like never before with our FM Radio Earwing. 
            Premium audio quality with unmatched comfort.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Product Image */}
          <div className="flex items-center justify-center order-1">
            <div className="w-full max-w-lg">
              <div className="card p-2 sm:p-3 md:p-4 lg:p-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 rounded-xl sm:rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative text-center">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 md:mb-4">
                    <img 
                      src="/Earwing.png" 
                      alt="FM Radio Earwing" 
                      className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain rounded-xl sm:rounded-2xl mx-auto group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm">
                    FM Radio Earwing
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="card p-3 sm:p-4 md:p-5 lg:p-6 order-2">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Price */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 sm:space-x-3 mb-1.5 sm:mb-2 flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                    ₹500
                  </h2>
                  <span className="bg-green-100 text-green-800 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    Best Price
                  </span>
                </div>
                <p className="text-xs text-gray-500">Per unit</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Experience premium audio like never before with our FM Radio Earwing. 
                  Features premium audio quality, advanced audio technology, and comfortable fit 
                  for extended wear. High-quality construction for lasting performance.
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2">Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2 flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 break-words">Crystal clear audio quality</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2 flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 break-words">Advanced audio technology</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2 flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 break-words">Comfortable ergonomic design</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1 sm:p-1.5 rounded-full mr-1.5 sm:mr-2 flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 break-words">Premium quality construction</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 sm:w-11 sm:h-11 min-w-[44px] min-h-[44px] rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-14 sm:w-16 h-10 sm:h-11 min-h-[44px] border-2 border-gray-300 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold text-gray-900 bg-gray-50">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="w-10 h-10 sm:w-11 sm:h-11 min-w-[44px] min-h-[44px] rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 sm:mt-1.5">Maximum 10 units per order</p>
              </div>

              {/* Total Price */}
              <div className="border-t-2 border-gray-100 pt-3 sm:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total:</span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-bold gradient-text">₹{quantity * 500}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 group min-h-[44px] active:scale-98"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Add to Cart
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              {/* Trust indicators */}
              <div className="flex items-center justify-center text-gray-500 text-xs">
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
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
  );
};

export default Shop;
