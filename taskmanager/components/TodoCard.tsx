import React from 'react';

interface Todo {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
  onStatusUpdate: (todoId: string, status: 'pending' | 'in-progress' | 'completed') => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit, onDelete, onStatusUpdate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-lg p-4 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-200 hover:scale-105">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white">{todo.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(todo)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit todo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo._id)}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Delete todo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {todo.description && (
        <p className="text-purple-200 text-sm mb-3">{todo.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
          {todo.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
          {todo.status}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-purple-300">
          Due: {formatDate(todo.deadline)}
        </span>
        <select
          value={todo.status}
          onChange={(e) => onStatusUpdate(todo._id, e.target.value as 'pending' | 'in-progress' | 'completed')}
          className="text-xs bg-black/30 border border-purple-500/30 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TodoCard;
