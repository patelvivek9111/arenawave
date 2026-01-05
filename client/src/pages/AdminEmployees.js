import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');
    if (!localStorage.getItem('employeeToken') || user.role !== 'admin') {
      navigate('/employee/login');
      return;
    }
    loadEmployees();
  }, [navigate]);

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Load employees error:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Employees Management</h1>
              <p className="text-xs text-gray-600">Manage employee accounts</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-700 transition duration-300 flex-1 sm:flex-none"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
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
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">No employees found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.username} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{employee.username}</h3>
                          <div className="flex flex-wrap gap-2 sm:gap-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employee.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {employee.role}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {employee.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-2 min-h-[44px] rounded text-xs sm:text-sm font-medium transition duration-300">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-2 min-h-[44px] rounded text-xs sm:text-sm font-medium transition duration-300">
                            Deactivate
                          </button>
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

export default AdminEmployees;

