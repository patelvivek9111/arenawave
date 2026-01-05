import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminCounters = () => {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [formData, setFormData] = useState({
    counter_id: '',
    name: '',
    location: '',
    initial_stock: '',
    low_stock_threshold: 10,
    critical_stock_threshold: 5
  });
  const [restockData, setRestockData] = useState({
    quantity: '',
    source_counter_id: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
    if (!localStorage.getItem('employeeToken') || user.role !== 'admin') {
      navigate('/employee/login');
      return;
    }
    loadCounters();
  }, [navigate]);

  const loadCounters = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/counters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounters(response.data.counters);
    } catch (error) {
      console.error('Load counters error:', error);
      setError('Failed to load counters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCounter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      // Use counter_id as name if name is not provided
      const payload = {
        ...formData,
        name: formData.counter_id // Use counter_id as the name
      };
      await axios.post(`${API_BASE_URL}/api/counters`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Counter created successfully!');
      setShowCreateModal(false);
      setFormData({
        counter_id: '',
        name: '',
        location: '',
        initial_stock: '',
        low_stock_threshold: 10,
        critical_stock_threshold: 5
      });
      loadCounters();
    } catch (error) {
      console.error('Create counter error:', error);
      setError(error.response?.data?.error || 'Failed to create counter');
    }
  };

  const handleEditCounter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      await axios.put(`${API_BASE_URL}/api/counters/${selectedCounter.counter_id}`, {
        location: formData.location,
        low_stock_threshold: formData.low_stock_threshold,
        critical_stock_threshold: formData.critical_stock_threshold,
        is_active: formData.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Counter updated successfully!');
      setShowEditModal(false);
      setSelectedCounter(null);
      loadCounters();
    } catch (error) {
      console.error('Update counter error:', error);
      setError(error.response?.data?.error || 'Failed to update counter');
    }
  };

  const handleRestockCounter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!restockData.source_counter_id) {
      setError('Please select a source for the stock');
      return;
    }

    try {
      const token = localStorage.getItem('employeeToken');
      const restockPayload = {
        quantity: parseInt(restockData.quantity),
        notes: restockData.notes || null
      };
      
      // If "new_stock" is selected, don't send source_counter_id
      if (restockData.source_counter_id && restockData.source_counter_id !== 'new_stock') {
        restockPayload.source_counter_id = restockData.source_counter_id;
      }

      await axios.put(`${API_BASE_URL}/api/counters/${selectedCounter.counter_id}/restock`, restockPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(restockData.source_counter_id && restockData.source_counter_id !== 'new_stock'
        ? `Stock transferred successfully!`
        : `Counter restocked successfully!`);
      setShowRestockModal(false);
      setSelectedCounter(null);
      setRestockData({
        quantity: '',
        source_counter_id: '',
        notes: ''
      });
      loadCounters();
    } catch (error) {
      console.error('Restock counter error:', error);
      setError(error.response?.data?.error || 'Failed to restock counter');
    }
  };

  const openEditModal = (counter) => {
    setSelectedCounter(counter);
    setFormData({
      location: counter.location || '',
      low_stock_threshold: counter.low_stock_threshold,
      critical_stock_threshold: counter.critical_stock_threshold,
      is_active: counter.is_active
    });
    setShowEditModal(true);
  };

  const openRestockModal = (counter) => {
    setSelectedCounter(counter);
    setRestockData({
      quantity: '',
      source_counter_id: '',
      notes: ''
    });
    setShowRestockModal(true);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'out':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return '✓';
      case 'low':
        return '⚠';
      case 'critical':
        return '⚠';
      case 'out':
        return '✗';
      default:
        return '?';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeUser');
    window.dispatchEvent(new Event('localStorageChange'));
    navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Counter Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage counters and stock levels</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-700 transition duration-300"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-700 transition duration-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Counter
          </button>
        </div>

        {/* Counters List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4">Loading counters...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {counters.map((counter) => (
              <div
                key={counter.counter_id}
                className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 border-2 ${getStockStatusColor(counter.stock_status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{counter.name}</h3>
                    <p className="text-xs text-gray-600">{counter.counter_id}</p>
                    {counter.location && (
                      <p className="text-xs text-gray-500 mt-1">📍 {counter.location}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStockStatusColor(counter.stock_status)}`}>
                    {getStockStatusIcon(counter.stock_status)} {counter.stock_status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-bold text-gray-900">{counter.current_stock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Initial Stock:</span>
                    <span className="text-gray-900">{counter.initial_stock}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Low Threshold:</span>
                    <span className="text-gray-700">{counter.low_stock_threshold}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Critical Threshold:</span>
                    <span className="text-gray-700">{counter.critical_stock_threshold}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Status:</span>
                    <span className={counter.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {counter.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(counter)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium hover:bg-blue-700 transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openRestockModal(counter)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium hover:bg-green-700 transition duration-300"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Counter</h2>
              <form onSubmit={handleCreateCounter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counter ID *</label>
                  <input
                    type="text"
                    value={formData.counter_id}
                    onChange={(e) => setFormData({ ...formData, counter_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initial_stock}
                    onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Critical Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.critical_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, critical_stock_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300"
                  >
                    Create Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        counter_id: '',
                        name: '',
                        location: '',
                        initial_stock: '',
                        low_stock_threshold: 10,
                        critical_stock_threshold: 5
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCounter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Counter: {selectedCounter.counter_id}</h2>
              <form onSubmit={handleEditCounter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Critical Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.critical_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, critical_stock_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300"
                  >
                    Update Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCounter(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && selectedCounter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Restock Counter: {selectedCounter.name}</h2>
              <form onSubmit={handleRestockCounter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={restockData.quantity}
                    onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                <select
                  value={restockData.source_counter_id}
                  onChange={(e) => setRestockData({ ...restockData, source_counter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-h-[44px]"
                  required
                >
                  <option value="">Select Source</option>
                  <option value="new_stock">New Stock (Brand new inventory)</option>
                  {counters
                    .filter(c => c.counter_id !== selectedCounter.counter_id && c.is_active && c.current_stock > 0)
                    .map(counter => (
                      <option key={counter.counter_id} value={counter.counter_id}>
                        {counter.name} ({counter.current_stock} available)
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select "New Stock" to add brand new inventory, or select a counter to transfer stock from.
                </p>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={restockData.notes}
                    onChange={(e) => setRestockData({ ...restockData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-green-700 transition duration-300"
                  >
                    {restockData.source_counter_id ? 'Transfer Stock' : 'Restock Counter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRestockModal(false);
                      setSelectedCounter(null);
                      setRestockData({
                        quantity: '',
                        source_counter_id: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCounters;

