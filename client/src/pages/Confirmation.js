import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Confirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order not found</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">Please place an order to view confirmation.</p>
              <Link
                to="/shop"
                className="bg-primary-600 text-white px-6 py-3 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-primary-700 transition duration-300 inline-flex items-center justify-center"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h1 className="text-lg sm:text-xl font-bold text-green-800">Order Confirmed!</h1>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Order Details */}
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-6">Order Details</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">{order.order_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Name:</span>
                    <span className="font-medium text-gray-900">{order.customer_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{order.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{order.phone}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">{order.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-primary-600">₹{order.total_price}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Important:</p>
                      <p>You will receive an email with your QR code. Present this QR code to collect your order.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-6">Your QR Code</h2>
                
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                  {order.qr_code ? (
                    <div>
                      <img 
                        src={order.qr_code} 
                        alt="QR Code" 
                        className="mx-auto mb-4 max-w-xs"
                      />
                      <p className="text-sm text-gray-600">
                        Present this QR code to collect your order
                      </p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-gray-500">QR Code will be sent via email</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Keep this QR code safe!</p>
                      <p>You'll need it to collect your order from our collection point.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="bg-primary-600 text-white px-6 py-3 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-primary-700 transition duration-300 flex items-center justify-center"
              >
                Back to Home
              </Link>
              <Link
                to="/shop"
                className="bg-gray-600 text-white px-6 py-3 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-gray-700 transition duration-300 flex items-center justify-center"
              >
                Shop More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
