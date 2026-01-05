import React from 'react';

const QRScannerView = ({
  videoRef,
  cameraError,
  isScanning,
  videoReady,
  scanStatus,
  onStartCamera,
  onStopCamera
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR Code
          </h2>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6">
          {cameraError ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-600 font-medium text-base">{cameraError}</p>
              </div>
              <button
                onClick={onStartCamera}
                className="bg-blue-600 text-white px-6 py-3 min-h-[44px] rounded-xl font-medium hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Camera View Container */}
              <div className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl w-full" style={{ aspectRatio: '4/3', minHeight: '250px', maxHeight: 'calc(100vh - 400px)' }}>
                {/* Video element - always rendered for ref attachment */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Placeholder when camera is not active */}
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 z-20 transition-opacity duration-300 ${isScanning && videoReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <div className="text-center px-4">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      {isScanning ? 'Starting camera...' : 'Camera not started'}
                    </p>
                  </div>
                </div>
                
                {/* QR Code Scanning Frame Overlay - perfectly centered */}
                {isScanning && (
                  <div 
                    className="absolute pointer-events-none z-30"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 'min(70vw, 280px)',
                      height: 'min(70vw, 280px)',
                      maxWidth: '280px',
                      maxHeight: '280px'
                    }}
                  >
                    {/* Outer frame - responsive size */}
                    <div className="absolute inset-0 border-3 sm:border-4 border-primary-400 rounded-xl sm:rounded-2xl shadow-2xl"></div>
                    
                    {/* Corner decorations - responsive size */}
                    <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 w-8 h-8 sm:w-12 sm:h-12 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-primary-500 rounded-tl-xl sm:rounded-tl-2xl"></div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-8 h-8 sm:w-12 sm:h-12 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-primary-500 rounded-tr-xl sm:rounded-tr-2xl"></div>
                    <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-8 h-8 sm:w-12 sm:h-12 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-primary-500 rounded-bl-xl sm:rounded-bl-2xl"></div>
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-8 h-8 sm:w-12 sm:h-12 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-primary-500 rounded-br-xl sm:rounded-br-2xl"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse"></div>
                  </div>
                )}
                
                {/* No overlay - finder window is completely clear with 0 tint */}
              </div>
              
              {/* Status and Controls */}
              <div className="space-y-3 sm:space-y-4">
                {/* Status Card */}
                <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                  scanStatus.includes('detected') || scanStatus.includes('Processing')
                    ? 'bg-green-50 border-green-200'
                    : scanStatus.includes('error') || scanStatus.includes('Error')
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {scanStatus.includes('detected') || scanStatus.includes('Processing') ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : scanStatus.includes('error') || scanStatus.includes('Error') ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    )}
                    <p className={`text-xs sm:text-sm font-medium text-center break-words ${
                      scanStatus.includes('detected') || scanStatus.includes('Processing')
                        ? 'text-green-700'
                        : scanStatus.includes('error') || scanStatus.includes('Error')
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      {scanStatus}
                    </p>
                  </div>
                </div>
                
                {/* Control Button */}
                <button
                  onClick={isScanning ? onStopCamera : onStartCamera}
                  className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 min-h-[48px] sm:min-h-[50px] rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg active:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isScanning 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white active:from-red-700 active:to-red-800' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white active:from-blue-700 active:to-indigo-700'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      <span>Stop Camera</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Start Camera</span>
                    </>
                  )}
                </button>
                
                {/* Helper Text */}
                <p className="text-xs text-gray-500 text-center mt-1 sm:mt-2 px-2">
                  {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-center">Make sure camera permissions are enabled</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-center">Camera will automatically scan QR codes</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerView;

