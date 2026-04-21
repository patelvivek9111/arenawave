import React from 'react';
import { PRODUCT_DISPLAY_NAME } from '../../config/product';
import { formatOrderMoney } from '../../utils/orderMoney';

const OrderDetailsView = ({
  scannedOrder,
  loading,
  error,
  success,
  historyLoading,
  viewedFromSearch,
  onViewCustomerHistory,
  onResendEmail,
  onGenerateSummary,
  onFulfillOrder,
  onClearOrder,
  onShowStatusModal,
  onShowNoteModal,
  onShowIssueModal,
  onToggleIssue
}) => {
  if (!scannedOrder) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-base font-semibold text-zinc-900 mb-3 sm:mb-4 text-center">Order Details</h2>
      
      {loading && (
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-zinc-600">Processing...</span>
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

      <div className="space-y-4 sm:space-y-6">
        {/* Order Header */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900">Order #{scannedOrder.order_id}</h3>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                scannedOrder.status === 'Pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : scannedOrder.status === 'Processing'
                  ? 'bg-zinc-100 text-zinc-800'
                  : scannedOrder.status === 'Fulfilled'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {scannedOrder.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-600">Total Amount</p>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">
                {formatOrderMoney(scannedOrder.total_price, scannedOrder.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-zinc-100">
              <span className="text-sm text-zinc-600 mb-1 sm:mb-0">Name</span>
              <span className="font-medium text-zinc-900">{scannedOrder.customer_name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-zinc-100">
              <span className="text-sm text-zinc-600 mb-1 sm:mb-0">Email</span>
              <a 
                href={`mailto:${scannedOrder.email}`}
                className="font-medium text-zinc-900 hover:text-zinc-700 break-all flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {scannedOrder.email}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
              <span className="text-sm text-zinc-600 mb-1 sm:mb-0">Phone</span>
              <a 
                href={`tel:${scannedOrder.phone}`}
                className="font-medium text-zinc-900 hover:text-zinc-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {scannedOrder.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`mailto:${scannedOrder.email}?subject=Order ${scannedOrder.order_id} - ArenaWav`}
              className="flex items-center justify-center px-4 py-3 bg-zinc-100 text-zinc-800 rounded-lg hover:bg-zinc-200 transition duration-300 border border-zinc-200 min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Email Customer</span>
            </a>
            <a
              href={`tel:${scannedOrder.phone}`}
              className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition duration-300 border border-green-200 min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium">Call Customer</span>
            </a>
            <button
              onClick={onResendEmail}
              disabled={loading}
              className="flex items-center justify-center px-4 py-3 bg-zinc-100 text-zinc-800 rounded-lg hover:bg-zinc-200 transition duration-300 border border-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">Resend Email</span>
            </button>
            <button
              onClick={onGenerateSummary}
              className="flex items-center justify-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition duration-300 border border-orange-200 col-span-1 sm:col-span-3 min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Generate Order Summary (Print/PDF)</span>
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Order Items
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{PRODUCT_DISPLAY_NAME}</p>
                <p className="text-sm text-zinc-600">
                  {formatOrderMoney(
                    scannedOrder.total_price / (scannedOrder.quantity || 1),
                    scannedOrder.currency
                  )}{' '}
                  per unit
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-600">Quantity</p>
                <p className="font-bold text-zinc-900">{scannedOrder.quantity}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-zinc-600">Subtotal</p>
                <p className="font-bold text-zinc-900">
                  {formatOrderMoney(scannedOrder.total_price, scannedOrder.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Information
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-zinc-100">
              <span className="text-sm text-zinc-600 mb-1 sm:mb-0">Payment Method</span>
              <span className="font-medium text-zinc-900">Pay at venue</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-zinc-100">
              <span className="text-sm text-zinc-600 mb-1 sm:mb-0">Subtotal</span>
              <span className="font-medium text-zinc-900">
                {formatOrderMoney(scannedOrder.total_price, scannedOrder.currency)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-zinc-100">
              <span className="text-sm font-semibold text-zinc-900">Total Amount</span>
              <span className="text-lg font-bold text-zinc-900">
                {formatOrderMoney(scannedOrder.total_price, scannedOrder.currency)}
              </span>
            </div>
            {/* Fulfill Order Button - Only show when order is not fulfilled */}
            {(scannedOrder.status === 'Pending' || scannedOrder.status === 'Processing') && (
              <div className="pt-3 border-t border-zinc-200">
                <button
                  onClick={onFulfillOrder}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <div className="pt-3 border-t border-zinc-200">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium">Order already fulfilled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Order Timeline
          </h4>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-zinc-900">Order Placed</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(scannedOrder.created_at).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {scannedOrder.status === 'Processing' && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-zinc-400 rounded-full mt-1.5"></div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-zinc-900">Order Processing</p>
                  <p className="text-xs text-zinc-600 mt-1">Order is being processed</p>
                </div>
              </div>
            )}
            {scannedOrder.status === 'Fulfilled' && scannedOrder.fulfilled_at && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-zinc-900">Order Fulfilled</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(scannedOrder.fulfilled_at).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {scannedOrder.fulfilled_by && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Fulfilled by: {scannedOrder.fulfilled_by}
                    </p>
                  )}
                </div>
              </div>
            )}
            {scannedOrder.status === 'Cancelled' && scannedOrder.cancelled_at && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-zinc-900">Order Cancelled</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(scannedOrder.cancelled_at).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {scannedOrder.cancelled_by && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Cancelled by: {scannedOrder.cancelled_by}
                    </p>
                  )}
                </div>
              </div>
            )}
            {scannedOrder.status === 'Pending' && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5"></div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-zinc-900">Awaiting Fulfillment</p>
                  <p className="text-xs text-zinc-600 mt-1">Order is pending fulfillment</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Flag */}
        {scannedOrder.has_issue && (
          <div className="bg-red-50 rounded-lg shadow-lg p-4 sm:p-6 border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-800 font-semibold">Order Has Issue</p>
                  {scannedOrder.issue_description && (
                    <p className="text-sm text-red-700 mt-1">{scannedOrder.issue_description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onToggleIssue(false)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Issue
              </button>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {scannedOrder.notes && scannedOrder.notes.length > 0 && (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes & Comments
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {scannedOrder.notes.map((note, index) => (
                <div key={index} className={`p-3 rounded-lg ${note.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-zinc-50 border border-zinc-200'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-zinc-900">{note.added_by}</p>
                    <span className="text-xs text-zinc-500">
                      {new Date(note.added_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700">{note.note}</p>
                  {note.is_internal && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Internal</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status History */}
        {scannedOrder.status_history && scannedOrder.status_history.length > 0 && (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-4">Status History</h4>
            <div className="space-y-3">
              {scannedOrder.status_history.map((history, index) => (
                <div key={index} className="flex items-start border-l-2 border-zinc-200 pl-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">
                      Changed to <span className="text-zinc-900">{history.status}</span>
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      by {history.changed_by} • {new Date(history.changed_at).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-xs text-zinc-500 mt-1 italic">"{history.note}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 sm:p-6 space-y-3">
          <button
            onClick={onViewCustomerHistory}
            disabled={historyLoading}
            className="w-full bg-zinc-900 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-800 transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {historyLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                View Customer Order History
              </>
            )}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onShowStatusModal}
              className="bg-zinc-900 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-800 transition duration-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change Status
            </button>
            <button
              onClick={onShowNoteModal}
              className="bg-zinc-700 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-600 transition duration-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add Note
            </button>
          </div>
          
          <button
            onClick={onShowIssueModal}
            className={`w-full py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium transition duration-300 flex items-center justify-center ${
              scannedOrder.has_issue
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {scannedOrder.has_issue ? 'Clear Issue Flag' : 'Flag as Issue'}
          </button>

          <button
            onClick={onClearOrder}
            className="w-full bg-gray-600 text-white py-3 px-4 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-gray-700 transition duration-300"
          >
            {viewedFromSearch ? 'Back to Search' : 'Clear Order & Scan Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;

