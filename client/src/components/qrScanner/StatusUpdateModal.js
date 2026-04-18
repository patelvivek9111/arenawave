import React from 'react';

const StatusUpdateModal = ({ 
  showModal, 
  onClose, 
  newStatus, 
  setNewStatus, 
  statusNote, 
  setStatusNote, 
  onUpdate, 
  loading,
  selectedCounter,
  orderQuantity
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Update Order Status</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2.5 min-h-[44px] border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {newStatus === 'Fulfilled' && (!selectedCounter || (selectedCounter && selectedCounter.current_stock < orderQuantity)) && (
            <div className={`p-3 rounded-lg ${
              !selectedCounter 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                !selectedCounter ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {!selectedCounter 
                  ? '⚠️ Please select a counter before fulfilling the order.'
                  : `⚠️ Insufficient stock. Available: ${selectedCounter.current_stock}, Required: ${orderQuantity}`
                }
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Note (Optional)</label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change..."
              rows="3"
              className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-100 text-zinc-700 py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-200 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onUpdate}
              disabled={!newStatus || loading}
              className="flex-1 bg-zinc-900 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;

