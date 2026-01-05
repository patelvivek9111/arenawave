import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
    if (!localStorage.getItem('employeeToken') || user.role !== 'admin') {
      navigate('/employee/login');
      return;
    }
    loadCustomers();
  }, [navigate]);

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Load customers error:', error);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      setSelectedCustomer(null);
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
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomerOrders = async (email) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/customer/${encodeURIComponent(email)}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCustomer(response.data.customer);
      setCustomerOrders(response.data.orders);
    } catch (error) {
      console.error('Load customer orders error:', error);
      setError('Failed to load customer orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.phone.includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Customers Management</h1>
              <p className="text-xs text-gray-600">Search customers and view order history</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-700 transition duration-300 flex-1 sm:flex-none"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition duration-300 flex-1 sm:flex-none"
              >
                Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
                loadCustomers();
                setSelectedCustomer(null);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-300 transition duration-300 whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>

        {selectedCustomer ? (
          /* Customer Details View */
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  ← Back to List
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-sm sm:text-base text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedCustomer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-sm sm:text-base font-bold text-primary-600">₹{selectedCustomer.totalSpent}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Last Order</p>
                  <p className="text-sm sm:text-base text-gray-900">
                    {new Date(selectedCustomer.lastOrder).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Order History</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-600">No orders found</p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order.order_id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">Order ID: {order.order_id}</p>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                              <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="text-gray-900 font-semibold">{order.quantity}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount</p>
                                <p className="text-gray-900 font-bold">₹{order.total_price}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Status</p>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  order.status === 'Pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <p className="text-gray-500">Date</p>
                                <p className="text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Customers List View */
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
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">No customers found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div key={customer.email} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 break-words">{customer.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                              <div>
                                <p className="text-gray-500">Email</p>
                                <p className="text-gray-900 break-words">{customer.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="text-gray-900">{customer.phone}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Orders</p>
                                <p className="text-gray-900 font-semibold">{customer.totalOrders}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Spent</p>
                                <p className="text-gray-900 font-bold text-primary-600">₹{customer.totalSpent}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Last order: {new Date(customer.lastOrder).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewCustomerOrders(customer.email)}
                            className="bg-primary-600 text-white px-4 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-700 transition duration-300 whitespace-nowrap"
                          >
                            View Orders
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;

