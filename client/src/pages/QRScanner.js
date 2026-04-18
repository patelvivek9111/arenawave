import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsQR from 'jsqr';
import { API_BASE_URL } from '../config/api';
import { formatMoney } from '../config/pricing';
import StatusUpdateModal from '../components/qrScanner/StatusUpdateModal';
import AddNoteModal from '../components/qrScanner/AddNoteModal';
import IssueFlagModal from '../components/qrScanner/IssueFlagModal';
import CustomerHistoryModal from '../components/qrScanner/CustomerHistoryModal';
import SearchOrdersTab from '../components/qrScanner/SearchOrdersTab';
import QRScannerView from '../components/qrScanner/QRScannerView';
import OrderDetailsView from '../components/qrScanner/OrderDetailsView';
import {
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
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [counterRecommendations, setCounterRecommendations] = useState(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockData, setRestockData] = useState({
    quantity: '',
    source_counter_id: '',
    notes: ''
  });
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

    loadCounters();
    startCamera();

    // Load saved counter selection from localStorage
    const savedCounterId = localStorage.getItem('selectedCounterId');
    if (savedCounterId && counters.length > 0) {
      const savedCounter = counters.find(c => c.counter_id === savedCounterId);
      if (savedCounter) {
        setSelectedCounter(savedCounter);
      }
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Load counter recommendations when selected counter changes
  useEffect(() => {
    if (selectedCounter) {
      loadCounterRecommendations(selectedCounter.counter_id);
    } else {
      setCounterRecommendations(null);
    }
  }, [selectedCounter]);

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

  const loadCounters = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/counters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounters(response.data.counters);
      
      // Auto-select first active counter if none selected
      if (!selectedCounter && response.data.counters.length > 0) {
        // Check for saved counter first
        const savedCounterId = localStorage.getItem('selectedCounterId');
        if (savedCounterId) {
          const savedCounter = response.data.counters.find(c => c.counter_id === savedCounterId && c.is_active);
          if (savedCounter) {
            setSelectedCounter(savedCounter);
            return;
          }
        }
        // Otherwise select first active counter
        const firstActive = response.data.counters.find(c => c.is_active) || response.data.counters[0];
        if (firstActive) {
          setSelectedCounter(firstActive);
          localStorage.setItem('selectedCounterId', firstActive.counter_id);
        }
      }
    } catch (error) {
      console.error('Load counters error:', error);
    }
  };

  const loadCounterRecommendations = async (counterId) => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get(`${API_BASE_URL}/api/counters/${counterId}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounterRecommendations(response.data);
    } catch (error) {
      console.error('Load recommendations error:', error);
    }
  };

  const handleFulfillOrder = async () => {
    if (!scannedOrder) return;

    if (!selectedCounter) {
      setError('Please select a counter before fulfilling the order');
      return;
    }

    // Check if counter has enough stock
    if (selectedCounter.current_stock < scannedOrder.quantity) {
      setError(`Insufficient stock. Available: ${selectedCounter.current_stock}, Required: ${scannedOrder.quantity}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/order/fulfill/${scannedOrder.order_id}`,
        { counter_id: selectedCounter.counter_id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('employeeToken')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Order marked as fulfilled successfully!');
        // Reload counters to update stock
        await loadCounters();
        // Update selected counter with new stock
        if (response.data.counter) {
          setSelectedCounter(response.data.counter);
        }
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

  const handleRestockCounter = async (e) => {
    e.preventDefault();
    if (!selectedCounter) return;

    if (!restockData.source_counter_id) {
      setError('Please select a source for the stock');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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

      const response = await axios.put(
        `${API_BASE_URL}/api/counters/${selectedCounter.counter_id}/restock`,
        restockPayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess(restockData.source_counter_id && restockData.source_counter_id !== 'new_stock'
          ? 'Stock transferred successfully!'
          : 'Counter restocked successfully!');
        setShowRestockModal(false);
        setRestockData({
          quantity: '',
          source_counter_id: '',
          notes: ''
        });
        // Reload counters
        await loadCounters();
        // Update selected counter
        if (response.data.counter) {
          setSelectedCounter(response.data.counter);
        }
      }
    } catch (error) {
      console.error('Restock error:', error);
      setError(error.response?.data?.error || 'Failed to restock counter');
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

    // If changing to Fulfilled, require counter selection
    if (newStatus === 'Fulfilled' && !selectedCounter) {
      setError('Please select a counter before fulfilling the order');
      setLoading(false);
      return;
    }

    // Check stock if fulfilling
    if (newStatus === 'Fulfilled' && selectedCounter) {
      if (selectedCounter.current_stock < scannedOrder.quantity) {
        setError(`Insufficient stock. Available: ${selectedCounter.current_stock}, Required: ${scannedOrder.quantity}`);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('employeeToken');
      const payload = { status: newStatus, note: statusNote };
      
      // Include counter_id if fulfilling
      if (newStatus === 'Fulfilled' && selectedCounter) {
        payload.counter_id = selectedCounter.counter_id;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/employee/order/${scannedOrder.order_id}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowStatusModal(false);
        setNewStatus('');
        setStatusNote('');
        // Reload counters to update stock if fulfilling
        if (newStatus === 'Fulfilled') {
          await loadCounters();
          // Update selected counter if response includes counter data
          if (response.data.counter) {
            setSelectedCounter(response.data.counter);
          }
        }
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
                  <span class="info-value">${formatMoney(summary.unit_price, summary.currency || 'USD')}</span>
                </div>
                <div class="total">
                  Total Amount: ${formatMoney(summary.total_price, summary.currency || 'USD')}
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 py-2">
            <div className="flex-1 flex justify-center sm:justify-start">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-zinc-700 mb-1">
                  Welcome, {employeeUser.username} ({employeeUser.role})
                </p>
                {/* Counter Selection */}
                <div className="flex flex-col sm:flex-row gap-1.5 sm:items-center justify-center sm:justify-start">
                  <label className="text-xs text-zinc-600 font-medium">Counter:</label>
                <select
                  value={selectedCounter?.counter_id || ''}
                  onChange={(e) => {
                    const counter = counters.find(c => c.counter_id === e.target.value);
                    setSelectedCounter(counter || null);
                    // Save to localStorage for persistence
                    if (counter) {
                      localStorage.setItem('selectedCounterId', counter.counter_id);
                    } else {
                      localStorage.removeItem('selectedCounterId');
                    }
                  }}
                    className="px-2 py-1 min-h-[40px] border border-zinc-200 rounded text-xs sm:text-sm focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 bg-white"
                  >
                    <option value="">Select Counter</option>
                    {counters
                      .filter(c => c.is_active)
                      .map(counter => (
                        <option key={counter.counter_id} value={counter.counter_id}>
                          {counter.name} ({counter.current_stock} units)
                        </option>
                      ))}
                  </select>
                  {selectedCounter && (
                    <button
                      onClick={() => setShowRestockModal(true)}
                      className="px-2.5 py-1 min-h-[40px] bg-zinc-900 text-white rounded text-xs sm:text-sm font-medium hover:bg-zinc-800 transition duration-300"
                    >
                      Restock
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {employeeUser.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-zinc-900 text-white px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded text-xs sm:text-sm font-medium hover:bg-zinc-800 transition duration-300"
                  title="Admin Dashboard"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition duration-300"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Stock Status & Recommendations */}
      {selectedCounter && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-2">
          <div className={`rounded-lg p-2 sm:p-2.5 border-2 ${
            selectedCounter.stock_status === 'good' ? 'bg-green-50 border-green-300' :
            selectedCounter.stock_status === 'low' ? 'bg-yellow-50 border-yellow-300' :
            selectedCounter.stock_status === 'critical' ? 'bg-orange-50 border-orange-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="flex flex-col gap-2">
              {/* Main Counter Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded ${
                    selectedCounter.stock_status === 'good' ? 'bg-green-100' :
                    selectedCounter.stock_status === 'low' ? 'bg-yellow-100' :
                    selectedCounter.stock_status === 'critical' ? 'bg-orange-100' :
                    'bg-red-100'
                  }`}>
                    <span className={`text-sm sm:text-base font-bold ${
                      selectedCounter.stock_status === 'good' ? 'text-green-800' :
                      selectedCounter.stock_status === 'low' ? 'text-yellow-800' :
                      selectedCounter.stock_status === 'critical' ? 'text-orange-800' :
                      'text-red-800'
                    }`}>
                      Counter {selectedCounter.counter_id}
                    </span>
                    <span className={`text-sm sm:text-base font-semibold ${
                      selectedCounter.stock_status === 'good' ? 'text-green-700' :
                      selectedCounter.stock_status === 'low' ? 'text-yellow-700' :
                      selectedCounter.stock_status === 'critical' ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {selectedCounter.current_stock}
                    </span>
                    <span className={`text-xs sm:text-sm font-medium ${
                      selectedCounter.stock_status === 'good' ? 'text-green-600' :
                      selectedCounter.stock_status === 'low' ? 'text-yellow-600' :
                      selectedCounter.stock_status === 'critical' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      units
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    selectedCounter.stock_status === 'good' ? 'bg-green-200 text-green-800 border-green-300' :
                    selectedCounter.stock_status === 'low' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
                    selectedCounter.stock_status === 'critical' ? 'bg-orange-200 text-orange-800 border-orange-300' :
                    'bg-red-200 text-red-800 border-red-300'
                  }`}>
                    {selectedCounter.stock_status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Recommendations */}
              {(selectedCounter.stock_status === 'low' || selectedCounter.stock_status === 'critical' || selectedCounter.stock_status === 'out') && counterRecommendations && counterRecommendations.recommendations.length > 0 && (
                <div className="pt-1.5 border-t border-zinc-200">
                  <p className="text-xs font-semibold text-zinc-700 mb-1">Recommended Counters:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {counterRecommendations.recommendations.slice(0, 3).map(rec => (
                      <span key={rec.counter_id} className="px-2 py-1 bg-white rounded border border-zinc-300 text-xs text-zinc-700 font-medium">
                        Counter {rec.counter_id} ({rec.current_stock} units)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Tabs */}
        {!scannedOrder && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-1 flex gap-2">
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
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
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
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Search Orders
              </button>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && !scannedOrder && (
          <SearchOrdersTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            searchLoading={searchLoading}
            error={error}
            onSearch={handleSearch}
            onViewOrder={handleViewOrder}
            onClear={() => {
              setSearchTerm('');
              setSearchResults([]);
              setError('');
            }}
          />
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
        selectedCounter={selectedCounter}
        orderQuantity={scannedOrder?.quantity}
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

      {/* Restock Modal */}
      {showRestockModal && selectedCounter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Restock Counter: {selectedCounter.name}</h2>
            <form onSubmit={handleRestockCounter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Source *</label>
                <select
                  value={restockData.source_counter_id}
                  onChange={(e) => setRestockData({ ...restockData, source_counter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 text-sm min-h-[44px]"
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
                <p className="text-xs text-zinc-500 mt-1">
                  Select "New Stock" to add brand new inventory, or select a counter to transfer stock from.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={restockData.notes}
                  onChange={(e) => setRestockData({ ...restockData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 text-sm"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-zinc-900 text-white py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (restockData.source_counter_id ? 'Transfer Stock' : 'Restock Counter')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setRestockData({
                      quantity: '',
                      source_counter_id: '',
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-zinc-100 text-zinc-700 py-2 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-200 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
