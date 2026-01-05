import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/90 via-primary-700/90 to-secondary-600/90"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-24">
          <div className="text-center animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="block">FM Radio</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">Earwing</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl mb-4 md:mb-6 text-primary-100 font-light">
              Experience premium audio like never before
            </p>
            
            <p className="text-sm sm:text-base mb-6 md:mb-8 text-primary-200 max-w-4xl mx-auto leading-relaxed">
              Get your hands on the premium FM Radio Earwing. 
              Enjoy immersive audio experience with premium quality sound and comfortable fit.
            </p>
            
            <div className="flex justify-center">
              <Link
                to="/shop"
                className="btn-primary text-base px-6 py-3 min-w-[160px] group"
              >
                <span className="flex items-center justify-center">
                  Shop Now
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Features */}
      <div className="py-8 sm:py-12 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">FM Radio Earwing?</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Premium audio quality and unmatched comfort for an immersive experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <div className="card p-6 sm:p-8 text-center group">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Premium Audio</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Crystal clear sound quality with advanced audio technology for immersive match experience
              </p>
            </div>

            <div className="card p-8 text-center group">
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Comfortable Fit</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ergonomic design with soft cushions for extended wear during the most exciting moments of the game
              </p>
            </div>

            <div className="card p-8 text-center group sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3">Authentic Quality</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Premium quality product ensuring the same high standards you expect
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Preview */}
      <div className="py-8 sm:py-12 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Experience the <span className="gradient-text">Difference</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                The FM Radio Earwing delivers exceptional audio quality with a comfortable, 
                secure fit that stays in place during the most exciting moments of the game.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">High-quality audio drivers for crystal clear sound</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Advanced audio technology</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Comfortable memory foam ear cushions</span>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Durable construction for long-lasting performance</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/shop"
                  className="btn-primary text-base px-6 py-3 min-w-[160px] group"
                >
                  <span className="flex items-center justify-center">
                    Get Yours Today - ₹500
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="text-center order-1 lg:order-2">
              <div className="card p-6 sm:p-8 md:p-12 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative">
                  <img 
                    src="/Earwing.png" 
                    alt="FM Radio Earwing" 
                    className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain rounded-2xl mx-auto mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-xl font-semibold">
                    FM Radio Earwing
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

export default Home;
