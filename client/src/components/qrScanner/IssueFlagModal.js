import React from 'react';

const IssueFlagModal = ({ 
  showModal, 
  onClose, 
  hasIssue, 
  issueDescription, 
  setIssueDescription, 
  onToggle, 
  loading 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {hasIssue ? 'Clear Issue Flag' : 'Flag Order as Issue'}
        </h3>
        <div className="space-y-4">
          {!hasIssue && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={() => onToggle(!hasIssue)}
              disabled={loading || (!hasIssue && !issueDescription.trim())}
              className={`flex-1 py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                hasIssue
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : hasIssue ? 'Clear Issue' : 'Flag as Issue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueFlagModal;

