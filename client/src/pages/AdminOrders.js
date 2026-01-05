import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
    if (!localStorage.getItem('employeeToken') || user.role !== 'admin') {
      navigate('/employee/login');
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Load orders error:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadOrders();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchTerm }
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('employeeToken');
      await axios.put(`${API_BASE_URL}/api/order/fulfill/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadOrders();
    } catch (error) {
      console.error('Order fulfillment error:', error);
      setError('Failed to fulfill order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-xs text-gray-600">Search and manage all orders</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-700 transition duration-300 flex-1 sm:flex-none"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/employee/scanner')}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition duration-300 flex-1 sm:flex-none"
              >
                QR Scanner
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order ID, name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary-600 text-white px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300 whitespace-nowrap"
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                loadOrders();
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-300 transition duration-300 whitespace-nowrap"
            >
              Clear
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          {loading && (
            <div className="p-8 text-center">
              <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          )}

          {error && (
            <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg m-4 sm:m-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="p-3 sm:p-4 md:p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col space-y-3 sm:space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 break-words">Order ID: {order.order_id}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Customer: {order.customer_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.status}
                            </span>
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleFulfillOrder(order.order_id)}
                                className="bg-green-600 text-white px-3 py-1.5 min-h-[44px] rounded text-xs sm:text-sm font-medium hover:bg-green-700 transition duration-300"
                              >
                                Fulfill
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Email</p>
                            <p className="text-gray-900 break-words">{order.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Phone</p>
                            <p className="text-gray-900">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Quantity</p>
                            <p className="text-gray-900 font-semibold">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Amount</p>
                            <p className="text-gray-900 font-bold">₹{order.total_price}</p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500">Order Date</p>
                              <p className="text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            {order.status === 'Fulfilled' && (
                              <>
                                {order.fulfilled_by && (
                                  <div>
                                    <p className="text-gray-500">Fulfilled By</p>
                                    <p className="text-gray-900">{order.fulfilled_by}</p>
                                  </div>
                                )}
                                {order.fulfilled_at && (
                                  <div>
                                    <p className="text-gray-500">Fulfilled At</p>
                                    <p className="text-gray-900">{new Date(order.fulfilled_at).toLocaleString()}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

