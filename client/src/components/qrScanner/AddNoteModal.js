import React from 'react';

const AddNoteModal = ({ 
  showModal, 
  onClose, 
  newNote, 
  setNewNote, 
  isNoteInternal, 
  setIsNoteInternal, 
  onAdd, 
  loading 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Note</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isInternal"
              checked={isNoteInternal}
              onChange={(e) => setIsNoteInternal(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isInternal" className="ml-2 text-sm text-gray-700">
              Internal note (not visible to customer)
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={!newNote.trim() || loading}
              className="flex-1 bg-primary-600 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;

