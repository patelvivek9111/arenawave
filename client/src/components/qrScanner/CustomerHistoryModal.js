import React from 'react';

const CustomerHistoryModal = ({ 
  showModal, 
  onClose, 
  customerHistory, 
  currentOrderId, 
  onViewOrder 
}) => {
  if (!showModal || !customerHistory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto overflow-x-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-3 sm:p-4 md:p-6 my-4 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Customer Order History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">{customerHistory.customer.name}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{customerHistory.customer.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{customerHistory.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 overflow-x-hidden">
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 md:p-4 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Orders</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 truncate">{customerHistory.stats.totalOrders}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 md:p-4 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Spent</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 truncate">₹{customerHistory.stats.totalSpent}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 sm:p-3 md:p-4 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Avg Order</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 truncate">₹{customerHistory.stats.averageOrderValue}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 sm:p-3 md:p-4 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Common Qty</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 truncate">{customerHistory.stats.mostCommonQuantity}</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 mb-6 overflow-x-hidden">
          <h4 className="text-base font-bold text-gray-900 mb-3">Status Breakdown</h4>
          <div className="flex flex-wrap gap-2 overflow-x-hidden">
            {Object.entries(customerHistory.stats.statusBreakdown).map(([status, count]) => (
              <span
                key={status}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : status === 'Processing'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'Fulfilled'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {status}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Order History */}
        <div className="w-full overflow-x-hidden">
          <h4 className="text-base font-bold text-gray-900 mb-4">All Orders ({customerHistory.orders.length})</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto overflow-x-hidden w-full">
            {customerHistory.orders.map((order) => (
              <div
                key={order.order_id}
                className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow overflow-hidden w-full ${
                  order.order_id === currentOrderId
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
                onClick={() => onViewOrder(order.order_id)}
              >
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-start justify-between gap-2 w-full min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base break-all">Order #{order.order_id}</span>
                        {order.order_id === currentOrderId && (
                          <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded whitespace-nowrap flex-shrink-0">Current</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                          order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Fulfilled'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                        {order.has_issue && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded whitespace-nowrap flex-shrink-0">⚠️ Issue</span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p className="break-words">Quantity: {order.quantity} • Total: ₹{order.total_price}</p>
                        <p className="break-words">Date: {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.order_id);
                      }}
                      className="bg-primary-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-700 transition duration-300 whitespace-nowrap flex-shrink-0 self-start"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;

