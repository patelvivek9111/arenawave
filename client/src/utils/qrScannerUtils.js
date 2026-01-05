/**
 * Utility functions for QR Scanner camera and scanning operations
 */

/**
 * Check if device is mobile
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get camera constraints based on device type
 */
export const getCameraConstraints = () => {
  const isMobile = isMobileDevice();
  
  return isMobile ? {
    facingMode: 'environment', // Use back camera on mobile
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    aspectRatio: { ideal: 1.7777777778 } // 16:9
  } : {
    facingMode: 'user', // Front camera on desktop (or use 'environment' for back)
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };
};

/**
 * Get user-friendly error message for camera errors
 */
export const getCameraErrorMessage = (error) => {
  let errorMessage = 'Unable to access camera. ';
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    errorMessage += 'Please allow camera permissions in your browser settings.';
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    errorMessage += 'No camera found on this device.';
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    errorMessage += 'Camera is already in use by another application.';
  } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
    errorMessage += 'Trying alternative camera settings...';
  } else {
    errorMessage += 'Please check camera permissions and try again.';
  }
  
  return errorMessage;
};

/**
 * Check if camera API is available
 */
export const isCameraAPIAvailable = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Capture a frame from video element to canvas
 */
export const captureFrame = (videoRef, canvasRef) => {
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

/**
 * Parse QR code data to extract order ID
 */
export const parseQRCodeData = (qrData) => {
  try {
    const orderData = JSON.parse(qrData);
    return orderData.order_id || orderData.id || orderData;
  } catch (parseError) {
    // If it's not JSON, treat it as a simple order ID
    return qrData;
  }
};

/**
 * Validate order ID from QR code
 */
export const validateOrderId = (orderId) => {
  if (!orderId) {
    throw new Error('No order ID found in QR code');
  }
  return orderId;
};

