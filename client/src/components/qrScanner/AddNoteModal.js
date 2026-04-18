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
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Add Note</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              rows="4"
              className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isInternal"
              checked={isNoteInternal}
              onChange={(e) => setIsNoteInternal(e.target.checked)}
              className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-300"
            />
            <label htmlFor="isInternal" className="ml-2 text-sm text-zinc-700">
              Internal note (not visible to customer)
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-100 text-zinc-700 py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-200 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={!newNote.trim() || loading}
              className="flex-1 bg-zinc-900 text-white py-2.5 px-4 min-h-[44px] rounded-lg text-sm font-medium hover:bg-zinc-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

