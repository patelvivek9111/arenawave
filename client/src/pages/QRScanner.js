import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsQR from 'jsqr';
import { API_BASE_URL } from '../config/api';

const QRScanner = () => {
  const [scannedOrder, setScannedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanStatus, setScanStatus] = useState('Ready to scan');
  const [showScanner, setShowScanner] = useState(true);
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
      
      // Check if device is mobile for camera optimization
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser. Please use a modern browser with camera support.');
      }
      
      // Mobile-optimized camera constraints
      const videoConstraints = isMobile ? {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        aspectRatio: { ideal: 1.7777777778 } // 16:9
      } : {
        facingMode: 'user', // Front camera on desktop (or use 'environment' for back)
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };
      
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
          setScanStatus('Camera started - scanning for QR codes...');
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Provide specific error messages for different scenarios
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        // Try fallback with simpler constraints
        errorMessage += 'Trying alternative camera settings...';
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
      } else {
        errorMessage += 'Please check camera permissions and try again.';
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
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Check if video is ready and playing
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    
    // Additional check to ensure video element is still valid
    if (!video.srcObject || !video.srcObject.active) {
      return null;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return context.getImageData(0, 0, canvas.width, canvas.height);
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
      // Try to parse the QR data as JSON
      let orderData;
      try {
        orderData = JSON.parse(qrData);
      } catch (parseError) {
        // If it's not JSON, treat it as a simple order ID
        orderData = { order_id: qrData };
      }

      // Extract order_id from the parsed data
      const orderId = orderData.order_id || orderData.id || orderData;

      if (!orderId) {
        throw new Error('No order ID found in QR code');
      }

      const response = await axios.post(`${API_BASE_URL}/api/order/fulfill`, {
        qrData: JSON.stringify({ order_id: orderId, type: 'order' })
      });

      if (response.data.success) {
        setScannedOrder(response.data.order);
        scannedOrderRef.current = response.data.order; // Set the ref immediately
        setShowScanner(false); // Hide scanner, show order details
        setScanStatus('Order found!');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError(error.response?.data?.error || 'Failed to process QR code');
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
        setScannedOrder(null);
        scannedOrderRef.current = null; // Clear the ref immediately
        setShowScanner(true); // Show scanner again
        setScanStatus('Ready to scan next QR code...');
        
        // Force a small delay to ensure state is cleared before restarting scanning
        setTimeout(() => {
          // Restart scanning if camera is still running
          if (isScanning && streamRef.current) {
            startScanning();
          }
        }, 100);
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
    setShowScanner(true); // Show scanner again
    setScanStatus('Ready to scan next QR code...');
    setError('');
    setSuccess('');
    
    // Force a small delay to ensure state is cleared before restarting scanning
    setTimeout(() => {
      // Always restart scanning if camera is available
      if (streamRef.current) {
        startScanning();
      }
    }, 200); // Increased delay to ensure state update
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeUser');
    navigate('/employee/login');
  };

  const employeeUser = JSON.parse(localStorage.getItem('employeeUser') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {employeeUser.username} ({employeeUser.role})
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {employeeUser.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video element - always rendered to maintain reference */}
        <div style={{ display: showScanner ? 'block' : 'none' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
            style={{ 
              maxHeight: '400px',
              objectFit: 'cover'
            }}
            onLoadedMetadata={() => {
              // Ensure video plays on mobile
              if (videoRef.current) {
                videoRef.current.play().catch(err => {
                  console.log('Auto-play prevented:', err);
                });
              }
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        {showScanner ? (
          // QR Scanner View
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Scan QR Code</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {cameraError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">{cameraError}</div>
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* Video element is now always rendered in the hidden div above */}
                  
                  {/* QR Code overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white rounded-lg" style={{ width: '250px', height: '250px' }}>
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">{scanStatus}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={isScanning ? stopCamera : startCamera}
                        className={`px-4 py-2 rounded-lg ${
                          isScanning 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isScanning ? 'Stop Camera' : 'Start Camera'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-4 text-center">
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                  <>
                    📱 Using your phone's back camera. Point at QR code to scan automatically.
                    <br />
                    <span className="text-xs text-gray-500">Make sure camera permissions are enabled.</span>
                  </>
                ) : (
                  'Camera will automatically scan QR codes every second'
                )}
              </p>
            </div>
          </div>
        ) : (
          // Order Details View
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Order Details</h2>
            
            {loading && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Processing...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-600">{success}</p>
                </div>
              </div>
            )}

            {scannedOrder && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium text-gray-900">{scannedOrder.order_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Name:</span>
                    <span className="font-medium text-gray-900">{scannedOrder.customer_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{scannedOrder.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{scannedOrder.phone}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">{scannedOrder.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-primary-600">₹{scannedOrder.total_price}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      scannedOrder.status === 'Pending' 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {scannedOrder.status}
                    </span>
                  </div>
                  
                  {scannedOrder.status === 'Fulfilled' && scannedOrder.fulfilled_by && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fulfilled by:</span>
                        <span className="font-medium text-gray-900">{scannedOrder.fulfilled_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fulfilled at:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(scannedOrder.fulfilled_at).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {scannedOrder.status === 'Pending' && (
                  <div className="mt-6">
                    <button
                      onClick={handleFulfillOrder}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Fulfilled
                        </>
                      )}
                    </button>
                  </div>
                )}

                {scannedOrder.status === 'Fulfilled' && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-yellow-700 font-medium">Order already fulfilled</p>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleClearOrder}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
                  >
                    Clear Order & Scan Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
