import React from 'react';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  todo: {
    title: string;
    description: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in-progress' | 'completed';
  };
  onChange: (field: string, value: string) => void;
  isEdit?: boolean;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  todo,
  onChange,
  isEdit = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isEdit 
                ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                : "M12 4v16m8-8H4"
              } 
            />
          </svg>
          {title}
        </h3>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={todo.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300"
              placeholder={isEdit ? "" : "Enter todo title"}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Description
            </label>
            <textarea
              value={todo.description}
              onChange={(e) => onChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300"
              rows={3}
              placeholder={isEdit ? "" : "Enter description (optional)"}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={todo.deadline}
              onChange={(e) => onChange('deadline', e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Priority
            </label>
            <select
              value={todo.priority}
              onChange={(e) => onChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {isEdit && todo.status && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Status
              </label>
              <select
                value={todo.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-purple-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-purple-700 transition"
            >
              {isEdit ? 'Update Todo' : 'Add Todo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-purple-800/50 text-purple-200 py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-purple-700/50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
