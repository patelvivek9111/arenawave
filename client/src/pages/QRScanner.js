import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsQR from 'jsqr';
import { API_BASE_URL } from '../config/api';
import StatusUpdateModal from '../components/qrScanner/StatusUpdateModal';
import AddNoteModal from '../components/qrScanner/AddNoteModal';
import IssueFlagModal from '../components/qrScanner/IssueFlagModal';
import CustomerHistoryModal from '../components/qrScanner/CustomerHistoryModal';
import SearchOrdersTab from '../components/qrScanner/SearchOrdersTab';
import QRScannerView from '../components/qrScanner/QRScannerView';
import OrderDetailsView from '../components/qrScanner/OrderDetailsView';
import {
  isMobileDevice,
  getCameraConstraints,
  getCameraErrorMessage,
  isCameraAPIAvailable,
  captureFrame as captureFrameUtil,
  parseQRCodeData,
  validateOrderId
} from '../utils/qrScannerUtils';

const QRScanner = () => {
  const [scannedOrder, setScannedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanStatus, setScanStatus] = useState('Ready to scan');
  const [showScanner, setShowScanner] = useState(true);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'search'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewedFromSearch, setViewedFromSearch] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isNoteInternal, setIsNoteInternal] = useState(true);
  const [issueDescription, setIssueDescription] = useState('');
  const [showCustomerHistory, setShowCustomerHistory] = useState(false);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const scannedOrderRef = useRef(null); // Add ref to track current scanned order
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      setCameraError('');
      setScanStatus('Starting camera...');
      
      // Check if getUserMedia is available
      if (!isCameraAPIAvailable()) {
        throw new Error('Camera API not supported in this browser. Please use a modern browser with camera support.');
      }
      
      // Get camera constraints based on device
      const videoConstraints = getCameraConstraints();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setScanStatus('Camera started - waiting for video...');
        
        // Wait for video to be loaded and then start scanning
        videoRef.current.onloadedmetadata = () => {
          setVideoReady(true);
          setScanStatus('Camera started - scanning for QR codes...');
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Get user-friendly error message
      let errorMessage = getCameraErrorMessage(err);
      
      // Handle fallback for OverconstrainedError
      if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setCameraError(errorMessage);
        setScanStatus('Retrying with default settings...');
        
        // Retry with minimal constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            streamRef.current = fallbackStream;
            setIsScanning(true);
            setScanStatus('Camera started - scanning for QR codes...');
            startScanning();
          }
          return; // Success, exit early
        } catch (fallbackErr) {
          errorMessage = 'Unable to access camera. Please check permissions and try again.';
        }
      }
      
      setCameraError(errorMessage);
      setScanStatus('Camera error');
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('employeeToken');
    if (!token) {
      navigate('/employee/login');
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Keep ref in sync with state
  useEffect(() => {
    scannedOrderRef.current = scannedOrder;
  }, [scannedOrder]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setVideoReady(false);
    setScanStatus('Camera stopped');
  };

  const startScanning = () => {
    // Clear any existing interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Start new scanning interval
    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 1000);
    
    setIsScanning(true); // Ensure scanning state is set
  };

  const captureFrame = () => {
    return captureFrameUtil(videoRef, canvasRef);
  };

  const scanQRCode = async () => {
    // Don't scan if we're loading or already have a scanned order
    if (loading || scannedOrderRef.current) {
      return;
    }
    
    try {
      const imageData = captureFrame();
      if (!imageData) {
        return;
      }
      
      // Use jsQR to scan for QR codes
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setScanStatus('QR Code found! Processing...');
        await processQRCode(code.data);
      } else {
        setScanStatus('Scanning... No QR code detected');
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setScanStatus('Scan error occurred');
    }
  };

  const processQRCode = async (qrData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setScannedOrder(null);
    scannedOrderRef.current = null; // Clear the ref immediately

    try {
      // Parse QR code data to extract order ID
      const orderId = parseQRCodeData(qrData);
      
      // Validate order ID
      validateOrderId(orderId);

      const response = await axios.post(`${API_BASE_URL}/api/order/fulfill`, {
        qrData: JSON.stringify({ order_id: orderId, type: 'order' })
      });

      if (response.data.success) {
        setScannedOrder(response.data.order);
        scannedOrderRef.current = response.data.order; // Set the ref immediately
        setShowScanner(false); // Hide scanner, show order details
        setScanStatus('Order found!');
        
        // Stop scanning interval when order is found (but keep camera running)
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to process QR code');
      setScanStatus('Order not found in database');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillOrder = async () => {
    if (!scannedOrder) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`${API_BASE_URL}/api/order/fulfill/${scannedOrder.order_id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('employeeToken')}`
        }
      });

      if (response.data.success) {
        setSuccess('Order marked as fulfilled successfully!');
        // Reload order details to get updated status
        await handleViewOrder(scannedOrder.order_id);
      }
    } catch (error) {
      console.error('Fulfillment error:', error);
      setError(error.response?.data?.error || 'Failed to fulfill order');
    } finally {
      setLoading(false);
    }
  };

  const handleClearOrder = () => {
    setScannedOrder(null);
    scannedOrderRef.current = null; // Clear the ref immediately
    setError('');
    setSuccess('');
    
    // If viewed from search, go back to search tab
    if (viewedFromSearch) {
      setShowScanner(false);
      setActiveTab('search');
      setViewedFromSearch(false);
    } else {
      // Otherwise, show scanner
      setShowScanner(true);
      setScanStatus('Ready to scan next QR code...');
      
      // Clear any existing scanning interval first
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Force a small delay to ensure state is cleared before restarting scanning
      setTimeout(() => {
        // Check if camera stream is still active
        if (streamRef.current && videoRef.current && videoRef.current.srcObject) {
          // Check if stream tracks are still active
          const tracks = streamRef.current.getTracks();
          const activeTracks = tracks.filter(track => track.readyState === 'live');
          
          if (activeTracks.length > 0) {
            // Camera is still running, restart scanning
            startScanning();
          } else {
            // Stream exists but tracks are not active, need to restart camera
            setScanStatus('Camera stopped. Please start camera again.');
            setIsScanning(false);
          }
        } else {
          // No stream, need to start camera
          setScanStatus('Camera not started. Please start camera.');
          setIsScanning(false);
        }
      }, 100); // Small delay to ensure state update
    }
  };

  const handleUpdateStatus = async () => {
    if (!scannedOrder || !newStatus) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/status`,
        { status: newStatus, note: statusNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowStatusModal(false);
        setNewStatus('');
        setStatusNote('');
        // Reload order details
        await handleViewOrder(scannedOrder.order_id);
      }
    } catch (error) {
      console.error('Update status error:', error);
      setError(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!scannedOrder || !newNote.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/notes`,
        { note: newNote, is_internal: isNoteInternal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Note added successfully!');
        setShowNoteModal(false);
        setNewNote('');
        setIsNoteInternal(true);
        // Reload order details
        await handleViewOrder(scannedOrder.order_id);
      }
    } catch (error) {
      console.error('Add note error:', error);
      setError(error.response?.data?.error || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIssue = async (hasIssue) => {
    if (!scannedOrder) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/issue`,
        { has_issue: hasIssue, issue_description: issueDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowIssueModal(false);
        setIssueDescription('');
        // Reload order details
        await handleViewOrder(scannedOrder.order_id);
      }
    } catch (error) {
      console.error('Toggle issue error:', error);
      setError(error.response?.data?.error || 'Failed to update issue flag');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomerHistory = async () => {
    if (!scannedOrder || !scannedOrder.email) return;

    setHistoryLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/employee/customer/${encodeURIComponent(scannedOrder.email)}/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCustomerHistory(response.data);
        setShowCustomerHistory(true);
      }
    } catch (error) {
      console.error('Get customer history error:', error);
      setError(error.response?.data?.error || 'Failed to load customer history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!scannedOrder) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/resend-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Order confirmation email resent successfully!');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setError(error.response?.data?.error || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!scannedOrder) return;

    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const summary = response.data.summary;
        
        // Create a printable summary
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Order Summary - ${summary.order_id}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 40px auto;
                  padding: 20px;
                  color: #333;
                }
                .header {
                  border-bottom: 3px solid #2563eb;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .header h1 {
                  color: #2563eb;
                  margin: 0;
                }
                .section {
                  margin-bottom: 30px;
                }
                .section h2 {
                  color: #2563eb;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #f3f4f6;
                }
                .info-label {
                  font-weight: 600;
                  color: #6b7280;
                }
                .info-value {
                  color: #111827;
                }
                .total {
                  font-size: 24px;
                  font-weight: bold;
                  color: #2563eb;
                  text-align: right;
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 2px solid #e5e7eb;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #e5e7eb;
                  text-align: center;
                  color: #6b7280;
                  font-size: 12px;
                }
                @media print {
                  body { margin: 0; padding: 20px; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>ArenaWave</h1>
                <p>Order Summary</p>
              </div>
              
              <div class="section">
                <h2>Order Information</h2>
                <div class="info-row">
                  <span class="info-label">Order ID:</span>
                  <span class="info-value">${summary.order_id}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value">${summary.status}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order Date:</span>
                  <span class="info-value">${new Date(summary.created_at).toLocaleString()}</span>
                </div>
                ${summary.fulfilled_at ? `
                <div class="info-row">
                  <span class="info-label">Fulfilled Date:</span>
                  <span class="info-value">${new Date(summary.fulfilled_at).toLocaleString()}</span>
                </div>
                ` : ''}
              </div>

              <div class="section">
                <h2>Customer Information</h2>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${summary.customer_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${summary.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${summary.phone}</span>
                </div>
              </div>

              <div class="section">
                <h2>Order Details</h2>
                <div class="info-row">
                  <span class="info-label">Product:</span>
                  <span class="info-value">${summary.product}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Quantity:</span>
                  <span class="info-value">${summary.quantity}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Unit Price:</span>
                  <span class="info-value">₹${summary.unit_price}</span>
                </div>
                <div class="total">
                  Total Amount: ₹${summary.total_price}
                </div>
              </div>

              <div class="footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>ArenaWave - Order Management System</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        // Wait for content to load, then print
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Generate summary error:', error);
      setError(error.response?.data?.error || 'Failed to generate order summary');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeUser');
    // Dispatch custom event to notify Navbar
    window.dispatchEvent(new Event('localStorageChange'));
    navigate('/employee/login');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/employee/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchTerm }
      });
      setSearchResults(response.data.orders || []);
      if (response.data.orders.length === 0) {
        setError('No orders found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.response?.data?.error || 'Failed to search orders');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/employee/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScannedOrder(response.data.order);
      setShowScanner(false);
      setViewedFromSearch(activeTab === 'search');
    } catch (error) {
      console.error('Get order error:', error);
      setError(error.response?.data?.error || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <p className="text-sm sm:text-base text-gray-700">
              Welcome, {employeeUser.username} ({employeeUser.role})
            </p>
            <div className="flex items-center gap-2">
              {employeeUser.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition duration-300"
                  title="Admin Dashboard"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-300"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Tabs */}
        {!scannedOrder && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm p-1 flex gap-2">
              <button
                onClick={() => {
                  setActiveTab('scan');
                  setShowScanner(true);
                  setSearchTerm('');
                  setSearchResults([]);
                  setError('');
                  // Restart scanning if camera is still running
                  setTimeout(() => {
                    if (streamRef.current && videoRef.current && videoRef.current.srcObject) {
                      const tracks = streamRef.current.getTracks();
                      const activeTracks = tracks.filter(track => track.readyState === 'live');
                      if (activeTracks.length > 0 && !scanIntervalRef.current) {
                        startScanning();
                      }
                    }
                  }, 100);
                }}
                className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'scan'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scan QR Code
              </button>
              <button
                onClick={() => {
                  setActiveTab('search');
                  setShowScanner(false);
                  if (isScanning) {
                    stopCamera();
                  }
                }}
                className={`flex-1 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search Orders
              </button>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && !scannedOrder && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-base font-semibold text-gray-900 mb-3 sm:mb-4 text-center">Search Orders</h2>
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search by order ID, name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-primary-600 text-white px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                      setError('');
                    }}
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
                    onClick={() => handleViewOrder(order.order_id)}
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
                          handleViewOrder(order.order_id);
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
        )}

        {/* Canvas for QR code detection (hidden) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {showScanner && activeTab === 'scan' ? (
          <QRScannerView
            videoRef={videoRef}
            cameraError={cameraError}
            isScanning={isScanning}
            videoReady={videoReady}
            scanStatus={scanStatus}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />
        ) : (
          <OrderDetailsView
            scannedOrder={scannedOrder}
            loading={loading}
            error={error}
            success={success}
            historyLoading={historyLoading}
            viewedFromSearch={viewedFromSearch}
            onViewCustomerHistory={handleViewCustomerHistory}
            onResendEmail={handleResendEmail}
            onGenerateSummary={handleGenerateSummary}
            onFulfillOrder={handleFulfillOrder}
            onClearOrder={handleClearOrder}
            onShowStatusModal={() => {
              setNewStatus(scannedOrder?.status || '');
              setShowStatusModal(true);
            }}
            onShowNoteModal={() => setShowNoteModal(true)}
            onShowIssueModal={() => {
              setIssueDescription(scannedOrder?.issue_description || '');
              setShowIssueModal(true);
            }}
            onToggleIssue={handleToggleIssue}
          />
        )}
      </div>

      <StatusUpdateModal
        showModal={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setNewStatus('');
          setStatusNote('');
        }}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        statusNote={statusNote}
        setStatusNote={setStatusNote}
        onUpdate={handleUpdateStatus}
        loading={loading}
      />

      <AddNoteModal
        showModal={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setNewNote('');
          setIsNoteInternal(true);
        }}
        newNote={newNote}
        setNewNote={setNewNote}
        isNoteInternal={isNoteInternal}
        setIsNoteInternal={setIsNoteInternal}
        onAdd={handleAddNote}
        loading={loading}
      />

      <CustomerHistoryModal
        showModal={showCustomerHistory}
        onClose={() => {
          setShowCustomerHistory(false);
          setCustomerHistory(null);
        }}
        customerHistory={customerHistory}
        currentOrderId={scannedOrder?.order_id}
        onViewOrder={handleViewOrder}
      />

      <IssueFlagModal
        showModal={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setIssueDescription('');
        }}
        hasIssue={scannedOrder?.has_issue || false}
        issueDescription={issueDescription}
        setIssueDescription={setIssueDescription}
        onToggle={handleToggleIssue}
        loading={loading}
      />
    </div>
  );
};

export default QRScanner;
