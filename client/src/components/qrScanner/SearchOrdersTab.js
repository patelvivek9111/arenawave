import React from 'react';

const SearchOrdersTab = ({ 
  searchTerm, 
  setSearchTerm, 
  searchResults, 
  searchLoading, 
  error, 
  onSearch, 
  onViewOrder, 
  onClear 
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-base font-semibold text-gray-900 mb-3 sm:mb-4 text-center">Search Orders</h2>
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by order ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="flex-1 px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={onSearch}
            disabled={searchLoading}
            className="bg-primary-600 text-white px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button
              onClick={onClear}
              className="bg-gray-200 text-gray-700 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-300 transition duration-300 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchLoading && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-600">Searching...</span>
          </div>
        </div>
      )}

      {error && searchTerm && !searchLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Found {searchResults.length} order(s)
          </h3>
          {searchResults.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewOrder(order.order_id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">Order ID:</span>
                    <span className="text-primary-600 font-medium">{order.order_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Fulfilled' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Customer:</span> {order.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {order.email}</p>
                    <p><span className="font-medium">Phone:</span> {order.phone}</p>
                    <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                    <p><span className="font-medium">Total:</span> ₹{order.total_price}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOrder(order.order_id);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300 mt-2 sm:mt-0"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchOrdersTab;

